const jwt = require("jsonwebtoken")
const resSend = require('../plugins/sendRes')

module.exports = (req, res, next) => {

    const token = req.headers.authorization


    jwt.verify(token, process.env.JWT_SECRET, async(err, user) => {
        if (err) {
            return resSend(res, false, "bad token", null)
        } else {
            req.body.user = user
            next()
        }
    })
}