const resSend = require('../plugins/sendRes')

module.exports = {
    registerUserValidate: (req, res, next) => {
        const {username, password, passwordTwo} = req.body
        console.log(username, password, passwordTwo)
        if (username.length > 21 || username.length < 4) {
            return res.send({error: true, message: "Password can not be short then 4 symbols or longer then 20.", data: null})

        }

        if (password.length > 21 || password.length < 4) {
            return res.send({error: true, message: "Password can not be short then 4 symbols or longer then 20.", data: null})

        }

        if (password !== passwordTwo) {
            return res.send({error: true, message: "Passwords do not match", data: null})
        }



        next()
    },
    loginUserValidate: (req, res, next) => {
        const {username, password} = req.body

        if (!("username" in req.body))
            return resSend(res, true, "missing tittle", null)

        if (!("password" in req.body))
            return res.send({error: true, message: "missing title", data: null})


        next()
    }
}