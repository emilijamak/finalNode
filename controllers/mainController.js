
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const resSend = require('../plugins/sendRes');
const userDb = require("../schemas/userSchema");
const messageDb = require("../schemas/messageSchema")
const conversationDb = require("../schemas/conversationSchema")
const { io } = require('../app'); // Adjust the path to where your socket instance is exported



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

        const msg = {
            sender: sender,
            recipient: recipient,
            message: message,
            timestamp: timestamp,
            read: false
        };

        try {
            // Save the new message
            const newMessage = new messageDb(msg);
            const savedMessage = await newMessage.save();

            // Find sender and recipient users
            const senderUser = await userDb.findOne({ username: sender });
            const recipientUser = await userDb.findOne({ username: recipient });

            if (!senderUser || !recipientUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find existing conversation
            let conversation = await conversationDb.findOne({
                participants: {
                    $all: [senderUser._id, recipientUser._id]
                }
            });

            if (conversation) {
                // Conversation exists, update it
                conversation.messages.push(savedMessage._id);
                conversation.lastMessage = savedMessage._id;
                await conversation.save();  // Save the updated conversation
            } else {
                // Create a new conversation
                const newConversation = new conversationDb({
                    participants: [senderUser._id, recipientUser._id],
                    messages: [savedMessage._id],
                    lastMessage: savedMessage._id
                });
                conversation = await newConversation.save();  // Save the new conversation
            }

            // Include the id in the response
            res.send({
                error: false,
                message: "Message sent successfully",
                data: {
                    ...savedMessage.toObject(),  // Convert mongoose document to plain object
                    _id: savedMessage._id.toString() // Ensure _id is a string
                }
            });

        } catch (error) {
            console.error("Error sending message:", error);
            res.send({
                error: true,
                message: "Error",
                data: null
            });
        }
    },
    getMessages: async (req, res) => {
        const { sender, recipient } = req.params;

        try {
            // Fetch messages
            const messages = await messageDb.find({
                $or: [
                    { sender: sender, recipient: recipient },
                    { sender: recipient, recipient: sender }
                ]
            }).sort({ timestamp: 1 }); // Sort messages by timestamp in ascending order

            // Fetch sender and recipient details
            const [senderUser, recipientUser] = await Promise.all([
                userDb.findOne({ username: sender }).select('username image'),
                userDb.findOne({ username: recipient }).select('username image')
            ]);

            // Add sender and recipient images to each message
            const messagesWithImages = messages.map(message => ({
                ...message.toObject(), // Convert Mongoose document to plain object
                senderImage: senderUser?.image || null,
                recipientImage: recipientUser?.image || null
            }));


            if (messages.length > 0) {
                res.send({ error: false, message: "Messages fetched successfully", data: messagesWithImages });

            } else {
                res.send({ error: true, message: "No messages found", data: [] });
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.send({ error: true, message: "Server error", data: null });
        }
    },getUserConversations: async (req, res) => {
        const { userID } = req.params;

        try {
            // Fetch conversations and populate fields
            const conversations = await conversationDb.find({
                participants: { $in: [userID] }
            })
                .populate('participants', 'username image') // Populate participant details
                .populate({
                    path: 'messages',
                    populate: [
                        { path: 'sender', select: 'username image' },
                        { path: 'recipient', select: 'username image' }
                    ]
                })
                .populate({
                    path: 'lastMessage',
                    populate: [
                        { path: 'sender', select: 'username image' },
                        { path: 'recipient', select: 'username image' }
                    ]
                });

            if (conversations) {
                res.send({ error: false, data: conversations });
            } else {
                res.send({ error: true, data: null, message: 'Failed fetching conversations' });
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(500).send({ error: true, message: 'Server error' });
        }
    },

    likeMessage: async (req, res) => {
        const { messageId, username, sender, recipient } = req.body;

        try {
            const message = await messageDb.findById(messageId);

            if (!message) {
                return res.send({ error: true, message: "Message not found", data: null });
            }

            if (message.liked.includes(username)) {
                return res.send({ error: true, message: "Already liked", data: null });
            }

            // Add the like
            message.liked.push(username);
            await message.save();

            // Fetch all related messages between the sender and recipient
            const messages = await messageDb.find({
                $or: [
                    { sender: sender.username, recipient: recipient.username },
                    { sender: recipient.username, recipient: sender.username }
                ]
            }).sort({ timestamp: 1 });

            // Fetch sender and recipient details once
            const [senderUser, recipientUser] = await Promise.all([
                userDb.findOne({ username: sender.username }).select('username image'),
                userDb.findOne({ username: recipient.username }).select('username image')
            ]);

            // Add sender and recipient images to each message correctly
            const messagesWithImages = messages.map(msg => ({
                ...msg.toObject(),
                senderImage: msg.sender === sender.username ? senderUser?.image : recipientUser?.image,
                recipientImage: msg.recipient === recipient.username ? recipientUser?.image : senderUser?.image
            }));

            res.send({ error: false, message: "Message liked successfully", data: messagesWithImages });
        } catch (error) {
            console.error("Error liking message:", error);
            res.send({ error: true, message: "Server error", data: null });
        }
    },
    deleteConversation: async (req, res) => {

        const { conversationId } = req.body;

        console.log(conversationId)

        // try {
        //     // Find the conversation by ID
        //     const conversation = await conversationDb.findById(conversationID);
        //
        //     if (!conversation) {
        //         return res.send({ error: true, message: "Conversation not found", data: null });
        //     }
        //
        //     // Extract message IDs from the conversation
        //     const messageIDs = conversation.messages;
        //
        //     // Delete all messages associated with the conversation
        //     await messageDb.deleteMany({ _id: { $in: messageIDs } });
        //
        //     // Delete the conversation
        //     await conversationDb.findByIdAndDelete(conversationID);
        //
        //     // Optionally, fetch updated conversations if needed
        //     const updatedConversations = await conversationDb.find().populate('participants', 'username image');
        //
        //     // Send success response
        //     res.send({ error: false, message: "Conversation deleted successfully", data: updatedConversations });
        // } catch (error) {
        //     console.error("Error deleting conversation:", error);
        //     res.send({ error: true, message: "Server error", data: null });
        // }
    },
    deleteAcc: async (req, res) => {
        const { userID } = req.body;

        try {
            // Delete the user
            const deletedUser = await userDb.findByIdAndDelete(userID);

            if (!deletedUser) {
                return res.send({ error: true, message: "User not found", data: null });
            }

            // Optionally: Delete related data, like messages
            await messageDb.deleteMany({ sender: deletedUser.username });
            const users = await userDb.find().select('-password');
            // Send a response
            res.send({ error: false, message: "Account deleted successfully", data: users});
        } catch (error) {
            console.error("Error deleting account:", error);
            res.send({ error: true, message: "Server error", data: null });
        }
    },

};
