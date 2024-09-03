const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages",
        },
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
    },
    createdAt:
        {
            type: Date,
            default: Date.now
        }
}, {timestamps: true});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
