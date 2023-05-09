const router = require('express').Router();
const otpservice = require("../services/otp_service");
const userservice = require('../services/user_service');
const tokenservice = require("../services/token_service");
const auth_mw = require("../middleware/auth_mw");
const User = require('../models/Usermodel');
const Refresh = require('../models/Refreshmodel');




router.post('/sendotp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) res.send("Please enter phone number...");

        const otp = await otpservice.generateOtp();
        const hash = await otpservice.hashOtp(otp);

        // await otpservice.sendOtp(phone, otp);
        res.json({ phone, hash, otp });
        // hash
    }
    catch (err) {
        res.json(err.messsage);
    }
})




// Otp in string may persist some problem in future
router.post('/verifyotp', async (req, res) => {
    try {
        const { Otp, Hash, Phone } = req.body;
        if (!Phone || !Otp || !Hash) res.send("Please fill required fields");

        const isValid = await otpservice.verifyOtp(Otp, Hash);
        if (!isValid) res.json("Invalid Otp");

        let user = await userservice.isUserAvailable({ phone: Phone });
        let newuser;

        if (user) res.json("Already have an account...");
        else {
            newuser = await userservice.createUser({ phone: Phone });
        }

        const { accessToken, refreshToken } = tokenservice.generateTokens(
            {
                "_id": newuser._id,
                "activated": false
            });

        await tokenservice.storeRefreshToken(refreshToken, newuser._id);

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        })

        res.json({ newuser, auth: true });
    }
    catch (err) {
        res.json(err.messsage);
    }
})




//  (auth_mw),
router.post('/activate', async (req, res) => {

    try {
        const { name, pic } = req.body;
        res.json({name});
        
//         if (!name && !pic) res.json("Fill all details...");
//         else{
//             const userId = req.user._id;

//             const user = await userservice.isUserAvailable({ _id: userId });
//             if (!user) res.json("User not available...");
//             else{
//                 user.activated = true;
//                 user.name = name;
//                 user.pic = pic;

//                 await user.save()
//                 res.json({userId})
//             }
//         }
        
    }
    catch (exc) {
        res.json(exc.message);
    }
})




// this route is not working . Work starts here
router.get("/refresh", async (req, res) => {

    let userData;
    const { refreshToken: refreshCookieToken } = req.cookies;

    try {
        userData = await tokenservice.verifyRefreshToken(refreshCookieToken);
        const returned = await tokenservice.findRefreshToken(userData._id, refreshCookieToken);
        if (!returned?.token) res.status(404).send("Invalid Toketn...");
        else {

            const user = await userservice.isUserAvailable({ _id: userData._id });
            if (!user) res.send("No user found...");

            const { accessToken, refreshToken } = tokenservice.generateTokens({ _id: userData._id });

            await tokenservice.updateRefreshToken(userData._id, refreshToken);

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })

            res.json({ user, auth: true })
            // res.json({ accessToken, refreshToken , refreshCookieToken })
        }
    }
    catch (exc) {
        res.status(401).json(exc.message)
    }



    // check valid
    // check if available in db
    // gen new token
    //  put in cookie
    // response

})





router.get("/logout", async (req, res) => {

    const {refreshToken} = req.cookies;
    try {
        await tokenservice.deleteToken(refreshToken);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({ user : null, auth : false })
    }
    catch (exc) {
        res.json(exc.message);
    }
})



module.exports = router;
