const resSend = require('../plugins/sendRes')

module.exports = {
    registerUserValidate: (req, res, next) => {

        const {username, password, passwordTwo} = req.body

        const uppercaseRegex = /[A-Z]/;
        const specialCharRegex = /[!@#$%^&*_+]/;

        if (username.length > 21 || username.length < 4) {
            return res.send({error: true, message: "Password can not be short then 4 symbols or longer then 20.", data: null})

        }

        if (password.length > 21 || password.length < 4) {
            return res.send({error: true, message: "Password can not be short then 4 symbols or longer then 20.", data: null})

        }

        if (password !== passwordTwo) {
            return res.send({error: true, message: "Passwords do not match", data: null})
        }

        if (!uppercaseRegex.test(password)) {
            return res.send({
                error: true,
                message: "Password must contain at least one uppercase letter.",
                data: null
            });
        }

        if (!specialCharRegex.test(password)) {
            return res.send({
                error: true,
                message: "Password must contain at least one special character (!@#$%^&*_+).",
                data: null
            });
        }


        next()
    },
    loginUserValidate: (req, res, next) => {
        const {username, password} = req.body
        if (username.length < 1)
            return resSend(res, true, "Missing username", null)

        if (password.length < 1)
            return res.send({error: true, message: "Missing password", data: null})


        next()
    },
    imageValidate: (req, res, next) => {

        const {imageUrl} = req.body

        const regexUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

        if (!regexUrl.test(imageUrl))
            return res.send({error: true, message: "Invalid url", data: null})


        next()

    },
    usernameValidate: (req, res, next) => {

        const {username} = req.body

        if (username.length > 21 || username.length < 4) {
            return res.send({error: true, message: "Password can not be short then 4 symbols or longer then 20.", data: null})

        }

        next()


    }
}