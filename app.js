const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http")
const { Server } = require("socket.io");
const { createServer } = require("http");
const mainRouter = require("./routers/mainRouter");
require("dotenv").config();
const app = express();

mongoose.connect(process.env.MONGO_KEY)
    .then(() => console.log("DB CONNECT SUCCESS"))
    .catch(err => {
        console.error("ERROR CONNECTING TO DB:", err);
    });

app.use(cors());
app.use(express.json());

app.use("/", mainRouter);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on('connection', (socket) => {

    //welcome when a user connects
    socket.emit('message', 'welcome to the chat')

    //when user connects
    socket.broadcast.emit('message', 'A user has joined the chat')


    //lsiten for chatmessage

    socket.on('chatMessage', (message) => {
        console.log(message)
    })

    //disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'a user has left the chat')
    })

});
const PORT = process.env.PORT ||  2000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error("Failed to start server:", err);
});

module.exports = { io };
