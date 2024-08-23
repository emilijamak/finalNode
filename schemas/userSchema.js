const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    },
});

const user = mongoose.model("users", userSchema);

module.exports = user;