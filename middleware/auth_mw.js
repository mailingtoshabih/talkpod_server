const token_service = require("../services/token_service");
const jwt = require('jsonwebtoken');





module.exports = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) throw new Error();

        const userData = jwt.verify( accessToken, "accesstoken" )
        if (!userData) throw new Error();

        req.user = userData;
        
        res.json({req.user});
        
        next();
    }
    catch (exc) {
        res.json(exc.message);
    }
}





