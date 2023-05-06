const router = require('express').Router();
const otpservice = require("../services/otp_service");
const userservice = require('../services/user_service');
const roomservice = require("../services/room_service");
const auth_mw = require("../middleware/auth_mw");
const User = require('../models/Usermodel');
const Refresh = require('../models/Refreshmodel');









router.post('/createroom', async (req, res) => {

    const {_id, roomTopic, roomType} = req.body;

    try {

        const room = await roomservice.createRoom({
            roomTopic,
            roomType,
            ownerId : _id
        })

        res.json(room);
    }
    catch (err) {
        res.json(err.messsage);
    }
})




router.get('/getrooms', async (req, res) => {

    try {
        const rooms = await roomservice.getRooms("public");
        res.json(rooms);
    }
    catch (err) {
        res.json(err.messsage);
    }
})



router.post('/getroom', async (req, res) => {

    const id = req.body.id;
    
    try {
        const room = await roomservice.getRoom(id);
        res.json(room);
    }
    catch (err) {
        res.json(err.messsage);
    }
})









module.exports = router;