require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require("mongoose");
const express = require('express');
const app = express();
const ACTIONS = require('./action');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})


const authRoutes = require('./routes/authRoute');
const roomRoutes = require('./routes/roomRoute');




// ---------------------------------------------------------------






mongoose.connect("mongodb+srv://alamshabih3:Shaebih8091@cluster0.hyyvg1q.mongodb.net/test")
    .then(() => console.log("Connected to db..."))
    .catch((err) => console.log(err.message));






const corsOption = {
    credentials: true,
    origin: ['https://talkpod.onrender.com'],
};



app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json({ limit: '6mb' }));
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);














// Sockets

const socketUserMapping = {

}



io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMapping[socket.id] = user;

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user
            });

            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMapping[clientId]
            });

        });
        socket.join(roomId);
    })


    // handle relay ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {

        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        })
    })


    //handle relay sdp
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription
        });
    });



    // handle mute
    socket.on(ACTIONS.MUTE, ({roomId, userId}) => {
        
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach( (clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId : socket.id,
                userId
            });
        }) 
    });



    // handle unmute
    socket.on(ACTIONS.UNMUTE, ({roomId, userId}) => {
        
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach( (clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId : socket.id,
                userId
            });
        })
    });
    





    // leaving room
    const leaveRoom = ({ roomId }) => {

        const { rooms } = socket;

        Array.from(rooms).forEach(roomId => {

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            
            clients.forEach( (clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId : socket.id,
                    userId : socketUserMapping[socket.id]?.id,
                });

                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId : clientId,
                    userId : socketUserMapping[clientId]?.id
                })
            });
            socket.leave(roomId);
        });
        delete socketUserMapping[socket.id];
    };
    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);


});
// ---------------------------------------------------------------





const port = process.env.PORT || 5500;
server.listen(port, () => console.log(`Listening on port ${port}`));
