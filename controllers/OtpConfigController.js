const OtpConfig = require('../models/otp_config');

const OtpConfigController = {

    getOtpConfig: async (req, res, next) => {
        try {
            const otpConfig = await OtpConfig.find();
            if (otpConfig.length > 0) {
                return res.status(200).json({
                    data: otpConfig,
                    message: "Get otpConfig success",
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "Otp Config not init",
                    status: false
                })
            }
        }
        catch (err) {
            next(err)
        }
    },

    postOtpConfig: async (req, res, next) => {
        try {
            if (req.error) {
                return res.status(401).json({
                    message: 'key invalid'
                })
            }
            const config = req.body.otp_config;
            if (config !== null && config !== '') {
                if (config === 'EMAIL' || config === 'SMS') {
                    const otpConfig = await OtpConfig.findOne({ config: config })
                    if (!otpConfig) {
                        const otp = await new OtpConfig({ config })
                        await otp.save()
                        return res.status(200).json({
                            message: 'Save successful',
                            status: true
                        })
                    }
                    OtpConfig.findByIdAndUpdate(otpConfig._id, { config },
                        (err, doc) => {
                            if (err) {
                                next(err)
                            }
                            else {
                                return res.status(200).json({
                                    message: 'Save successful',
                                    status: true
                                })
                            }
                        })
                }
                else {
                    return res.status(200).json({
                        message: 'You need provide config EMAIL or SMS',
                        status: false
                    })
                }
            }
            else {
                return res.status(200).json({
                    message: 'config can not null',
                    status: false
                })
            }
        }
        catch (err) {
            next(err)
        }
    },

    putOtpConfig: async (req, res, next) => {
        try {
            if (req.error) {
                return res.status(401).json({
                    message: 'key invalid'
                })
            }
            const config = req.body.otp_config;
            if (config !== null && config !== '') {
                if (config === 'EMAIL' || config === 'SMS') {
                    const otpConfig = await OtpConfig.findOne()
                    if (!otpConfig) {
                        const otp = await new OtpConfig({ config })
                        await otp.save()
                        return res.status(200).json({
                            message: 'Create successful',
                            status: true
                        })
                    }
                    OtpConfig.findByIdAndUpdate(otpConfig._id, { config },
                        (err, doc) => {
                            if (err) {
                                next(err)
                            }
                            else {
                                return res.status(200).json({
                                    message: 'Update successful',
                                    status: true
                                })
                            }
                        })
                }
                else {
                    return res.status(200).json({
                        message: 'You need provide config EMAIL or SMS',
                        status: false
                    })
                }
            }
            else {
                return res.status(200).json({
                    message: 'config can not null',
                    status: false
                })
            }
        }
        catch (err) {
            next(err)
        }
    }

}
module.exports = OtpConfigController;
