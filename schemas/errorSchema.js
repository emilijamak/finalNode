const errorDb = require('../schemas/errorSchema')

module.exports = async (error) => {
    const newError = new errorDb({
        ...error,
        time: Date.now()
    })

    await newError.save()

    return true
}