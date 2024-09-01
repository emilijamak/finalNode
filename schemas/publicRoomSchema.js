const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const publicRoomSchema = new Schema({
    participants: [
        {
            type: String,
            required: true,
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages", // Reference to the Message model
        },
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages", // Reference to the latest message
    },
    createdAt:
        {
            type: Date,
            default: Date.now
        }
}, {timestamps: true}); // Automatically manage createdAt and updatedAt fields

const PublicRoom = mongoose.model("PublicRoom", publicRoomSchema);

module.exports = PublicRoom;
