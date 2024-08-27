const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {
        type: String,
        required: true,
    },
    recipient: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        required: true,
        defaultValue: false
    }

});

const message = mongoose.model("messages", messageSchema);

module.exports = message;