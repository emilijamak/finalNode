
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const resSend = require('../plugins/sendRes');
const userDb = require("../schemas/userSchema");




module.exports = {
    register: async (req, res) => {
        console.log('hey');

        const { password, username } = req.body;

        const existingUser = await userDb.findOne({ username: username });

        if (existingUser) {
            return res.send({ error: true, message: "Username already exists", data: null });
        }



        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = {
            username: username,
            password: passwordHash,
        };

        console.log(passwordHash);

        const newUser = new userDb(user);
        await newUser.save();
        const users = await userDb.find().select('-password');

        if (users) {
            res.send({ error: false, message: "success", data: users });
        } else {
            res.send({ error: true, message: "could register", data: null });
        }
    },
    login: async (req, res) => {
        const { password, username } = req.body;
        const currentUser = await userDb.findOne({ username: username });

        if (!currentUser) {
            return res.send({ error: true, message: "user doesnt exist", data: null });
        }

        const passHash = currentUser.password;
        const passValid = await bcrypt.compare(password, passHash);
        console.log(passValid);

        if (passValid) {
            const data = {
                id: currentUser._id,
                username: currentUser.username
            };

            const token = jwt.sign(data, process.env.JWT_SECRET);
            const { password, ...updatedUser } = currentUser.toObject();

            return resSend(res, true, null, { token, updatedUser });
        } else {
            res.send({ error: true, message: "not success", data: null });
        }
    }
};