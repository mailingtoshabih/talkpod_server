const jwt = require('jsonwebtoken');
const Refresh = require('../models/Refreshmodel');
const Room = require('../models/Roommodel');


class RoomService {

    async createRoom(payload) {
        const { roomTopic, roomType, ownerId } = payload;

        const room = await Room.create({
            roomTopic, roomType, ownerId, speakers: [ownerId]
        });

        return room;
    }


    async getRooms(type) {

        const room = await Room.find({ roomType: type })
            .populate('speakers')
            .populate('ownerId')
            .exec();
        return room;
    }



    async getRoom(id) {
        const room = await Room.findOne({ _id: id })
            .populate('ownerId')
            .exec();
        return room;
    }







}


module.exports = new RoomService();