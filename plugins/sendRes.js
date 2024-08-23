module.exports = ( res, success, message, data) => {
    res.send({success, message, data})
}