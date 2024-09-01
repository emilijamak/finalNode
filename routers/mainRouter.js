const express = require('express')
const Router = express.Router()
const {
    register,
    login, changeImage, changeUsername, changePassword, getAllUsers, getUserByUsername, sendMessage, getMessages,
    likeMessage, deleteAcc, getUserConversations, getConversationDetails, deleteConversation, getConversationById,
    getPublicRoomMessages
} = require("../controllers/mainController")


const {
    registerUserValidate, loginUserValidate, validateUser, imageValidate, usernameValidate, messageValidate

} = require('../middleware/validators')

const authMiddle = require('../middleware/auth')



Router.post('/register', registerUserValidate, register)
Router.post('/login',loginUserValidate, login)
Router.post('/change-image', authMiddle, imageValidate,  changeImage)
Router.post('/change-username', authMiddle, usernameValidate,  changeUsername)
Router.post('/change-password', authMiddle, registerUserValidate,  changePassword)
Router.post('/send-message', authMiddle, messageValidate, sendMessage)
Router.get('/get-all-users', getAllUsers)
Router.get('/get-user/:username', getUserByUsername)
Router.get('/get-messages/:sender/:recipient', getMessages);
Router.post('/like-message', authMiddle, likeMessage)
Router.post('/delete-account', authMiddle, deleteAcc)
Router.get('/conversations/:userID', getUserConversations)
Router.get('/conversation/:conversationId', getConversationById)
Router.get('/get-public-room-messages', getPublicRoomMessages)
Router.post('/deleteConversation/:conversationId', authMiddle, deleteConversation)





module.exports = Router