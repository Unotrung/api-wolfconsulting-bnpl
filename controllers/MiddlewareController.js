const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const MiddlewareController = {

    verifyToken: (req, res, next) => {
        try {
            const token = req.header('authorization');
            if (token) {
                // 'Beaer [token]'
                const accessToken = token.split(' ')[1];
                jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                    if (err) {
                        return res.status(403).json({
                            message: 'Token is not valid',
                            statusCode: 4003
                        });
                    }
                    // Trả về user
                    req.user = user;
                    next();
                });
            }
            else {
                return res.status(401).json({
                    message: "You're not authenticated",
                    statusCode: 4001
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyTokenByMySelf: (req, res, next) => {
        try {
            MiddlewareController.verifyToken(req, res, () => {
                if (req.user.id === req.params.id || req.user.phone === req.params.phone || req.user.phone === req.body.phone) {
                    next();
                }
                else {
                    return res.status(403).json({
                        message: 'You are not allowed to do this action',
                        statusCode: 4004
                    });
                }
            })
        }
        catch (err) {
            next(err);
        }
    },

    validateRequestSchema: (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (errors.errors.length > 0) {
                return res.status(400).json({
                    message: errors.errors[0].msg,
                    status: false,
                    errorCode: 8000
                });
            }
            else {
                next();
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifySecurity: (req, res, next) => {
        try {
            const appKey = req.headers.appkey;
            const appId = req.headers.appid;
            if (appKey && appId && appKey === process.env.APP_KEY && appId === process.env.APP_ID) {
                req.isAuthenticated = true;
                next();
            }
            else {
                return res.status(401).json({
                    message: 'You do not have permission to access this app',
                    statusCode: 9000
                });
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = MiddlewareController;