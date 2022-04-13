const dotenv = require('dotenv')
dotenv.config()

const master = async (req, res, next) => {
    try {
        const masterKey = req.query.masterKey

        if (!masterKey || masterKey !== process.env.MASTER_KEY) {
            req.error = new Error('Authenticate error')
            req.error.code = 401
            return next()
        }
        req.isAuthenticated = true
        return next()
    }
    catch (err) {
        next(err);
    }

}
module.exports = { master }
