const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users", // Reference to the User model
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

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
