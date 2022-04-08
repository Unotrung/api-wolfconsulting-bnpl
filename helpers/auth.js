const dotenv = require('dotenv')
dotenv.config()

const master = async (req, res, next) => {
    const masterKey = req.query.masterKey
    console.log('master')
    if (!masterKey || masterKey !== process.env.masterKey) {
        req.error = new Error('Authenticate error')
        req.error.code = 401
        return next()
    }
    req.isAuthenticad = true
    return next()

}
module.exports = {master}
