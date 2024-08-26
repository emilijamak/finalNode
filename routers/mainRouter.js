const express = require('express')
const Router = express.Router()
const {
    register,
    login, changeImage, changeUsername
} = require("../controllers/mainController")


const {
    registerUserValidate, loginUserValidate, validateUser, imageValidate, usernameValidate

} = require('../middleware/validators')

const authMiddle = require('../middleware/auth')



Router.post('/register', registerUserValidate, register)
Router.post('/login',loginUserValidate, login)
Router.post('/change-image', authMiddle, imageValidate,  changeImage)
Router.post('/change-username', authMiddle, usernameValidate,  changeUsername)



module.exports = Router