
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const resSend = require('../plugins/sendRes');
const userDb = require("../schemas/userSchema");
const messageDb = require("../schemas/messageSchema")


module.exports = {
    register: async (req, res) => {
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

        const newUser = new userDb(user);
        await newUser.save();
        const users = await userDb.find().select('-password');

        if (users) {
            res.send({ error: false, message: "success", data: users });
        } else {
            res.send({ error: true, message: "could not register", data: null });
        }
    },
    login: async (req, res) => {
        const { password, username } = req.body;
        const currentUser = await userDb.findOne({ username: username });

        if (!currentUser) {
            return res.send({ error: true, message: "user doesn't exist", data: null });
        }

        const passHash = currentUser.password;
        const passValid = await bcrypt.compare(password, passHash);

        if (passValid) {
            const data = {
                id: currentUser._id,
                username: currentUser.username
            };

            const token = jwt.sign(data, process.env.JWT_SECRET);
            const { password, ...updatedUser } = currentUser.toObject();

            return resSend(res, true, null, { token, updatedUser });
        } else {
            res.send({ error: true, message: "bad credentials", data: null });
        }
    },
    changeImage: async (req, res) => {

        const { imageUrl, userID } = req.body;

        try {
            const updatedUser = await userDb.findByIdAndUpdate(
                userID,               // The ID of the user to update
                { image: imageUrl },   // The update to apply (set the image field to the new URL)
                { new: true }          // Option to return the updated document
            );

            if (!updatedUser) {
                return res.send({ error: true, message: "User not found", data: null });
            }

            const { password, ...user } = updatedUser.toObject();


            // Successfully updated the user's image
            res.send({ error: false, message: "Image updated successfully", user });
        } catch (error) {
            console.error("Error updating image:", error);
            res.send({ error: true, message: "Server error", data: null });
        }

    },
    changeUsername: async (req, res) => {

        const { username, userID } = req.body;

        const existingUser = await userDb.findOne({ username });

        if (existingUser) {
            return res.send({ error: true, message: "Username already taken", data: null });

        }

        try {
            const updatedUser = await userDb.findByIdAndUpdate(
                userID,
                { username: username },
                { new: true }
            );

            if (!updatedUser) {
                return res.send({ error: true, message: "User not found", data: null });
            }

            const { password, ...user } = updatedUser.toObject();


            // Successfully updated the user's image
            res.send({ error: false, message: "Username successfully updated", user });
        } catch (error) {
            console.error("Error updating image:", error);
            res.send({ error: true, message: "Server error", data: null });
        }

    },
    changePassword: async (req, res) => {
        const { userID, password, username } = req.body;

        const currentUser = await userDb.findOne({ _id: userID, username });

        if (!currentUser) {
            return res.send({ error: true, message: "User not found", data: null });
        }

        try {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            // Update the user's password
            currentUser.password = await bcrypt.hash(password, salt);
            await currentUser.save();

            // Send success response
            res.send({ error: false, message: "Password changed successfully", data: null });
        } catch (error) {
            console.error("Error changing password:", error);
            res.send({ error: true, message: "Server error", data: null });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await userDb.find().select('-password'); // Exclude passwords
            res.send({ error: false, message: "Users fetched successfully", data: users });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.send({ error: true, message: "Server error", data: null });
        }
    },
    getUserByUsername: async (req, res) => {
        try {
            const user = await userDb.findOne({ username: req.params.username }).select('-password'); // Exclude password
            if (user) {
                res.send({ error: false, message: "User fetched successfully", data: user });
            } else {
                res.send({ error: true, message: "User not found", data: null });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            res.send({ error: true, message: "Server error", data: null });
        }
    }, sendMessage: async (req, res) => {
        const { sender, recipient, message, timestamp } = req.body;
        try {
            const newMessage = new messageDb({ sender, recipient, message, timestamp });
            await newMessage.save();

            res.send({ error: false, message: "message send", data: null });

        } catch (error) {
            res.send({ error: true, message: "error", data: null });

        }
    }

};
