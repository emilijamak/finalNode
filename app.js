const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routers/mainRouter");
const socketController = require("./controllers/socketController"); // Import the socket controller
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

// Delegate connection handling to the socket controller
io.on('connection', (socket) => {
    socketController.handleConnection(socket, io);
});

const PORT = process.env.PORT || 2000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error("Failed to start server:", err);
});

module.exports = { io };
