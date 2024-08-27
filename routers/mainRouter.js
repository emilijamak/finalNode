const express = require('express')
const Router = express.Router()
const {
    register,
    login, changeImage, changeUsername, changePassword, getAllUsers, getUserByUsername, sendMessage
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



module.exports = Router