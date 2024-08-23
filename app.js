const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => {
    console.log("a user connected");
    // Add more socket event handlers if needed
});

const PORT = process.env.PORT || 2001;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error("Failed to start server:", err);
});

module.exports = { io };
