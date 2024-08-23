const express = require('express')
const Router = express.Router()
const {
    register,
    login
} = require("../controllers/mainController")


const {
    registerUserValidate, loginUserValidate

} = require('../middleware/validators')

const authMiddle = require('../middleware/auth')



Router.post('/register', registerUserValidate, register)
Router.post('/login',loginUserValidate, login)



module.exports = Router