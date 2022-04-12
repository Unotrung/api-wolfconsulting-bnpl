const Customer = require('../models/bnpl_customers');
const Personal = require('../models/bnpl_personals');
const Otp = require('../models/bnpl_otps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { buildProdLogger } = require('../helpers/logger');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

let refreshTokens = [];

const UserController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "20m" }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "5h" }
        );
    },

    checkPhoneExists: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (phone !== null && phone !== '') {
                    const users = await Customer.find();
                    const user = users.find(x => x.phone === phone);
                    if (user) {
                        return res.status(200).json({
                            data: {
                                _id: user.id,
                                phone: user.phone,
                                step: user.step
                            },
                            message: "This phone number is already exists !",
                            status: true
                        });
                    }
                    else if (phone.startsWith('033')) {
                        return res.status(200).json({
                            message: "This phone number is not exists in EAP !",
                            status: false,
                            errCode: 1001,
                        });
                    }
                    else if (phone.startsWith('044')) {
                        return res.status(200).json({
                            message: "This phone number is not exists in BNPL !",
                            status: false,
                            errCode: 1002,
                        });
                    }
                    else {
                        return res.status(200).json({
                            message: "This phone number is not exists !",
                            status: false,
                            errCode: 1003,
                            step: 1
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone. Do not leave any field blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkNidExists: async (req, res, next) => {
        try {
            let nid = req.body.nid;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (nid !== null && nid !== '') {
                    const users = await Personal.find();
                    const user = users.find(x => x.citizenId === nid);
                    if (user) {
                        return res.status(200).json({
                            data: {
                                _id: user.id,
                                nid: user.citizenId
                            },
                            message: "This nid is already exists !",
                            status: true
                        });
                    }
                    else {
                        return res.status(200).json({
                            message: "This nid is not exists !",
                            status: false,
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your nid. Do not leave any field blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    register: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let PIN = req.body.pin;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '') {
                    const auths = await Customer.find();
                    const auth = auths.find(x => x.phone === PHONE);
                    if (auth) {
                        return res.status(200).json({
                            message: "This account is already exists. Please login !",
                        });
                    }
                    else {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(PIN, salt);
                        const user = await new Customer({ phone: PHONE, pin: hashed, step: 2 });
                        const accessToken = UserController.generateAccessToken(user);
                        await user.save((err, data) => {
                            if (!err) {
                                const { pin, __v, ...others } = data._doc;
                                buildProdLogger('info', 'register_customer_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                return res.status(201).json({
                                    message: "Register successfully",
                                    data: { ...others },
                                    token: accessToken,
                                    status: true
                                });
                            }
                            else {
                                buildProdLogger('error', 'register_customer_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                return res.status(200).json({
                                    message: "Register failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                });
                            }
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone and pin code. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let PIN = req.body.pin;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '') {
                    const users = await Customer.find();
                    const user = users.find(x => x.phone === PHONE);
                    if (!user) {
                        return res.status(200).json({ message: "Wrong phone. Please try again !", status: false });
                    }
                    const valiPin = await bcrypt.compare(PIN, user.pin);
                    if (!valiPin) {
                        return res.status(200).json({ message: "Wrong pin. Please try again !", status: false });
                    }
                    if (user && valiPin) {
                        const accessToken = UserController.generateAccessToken(user);
                        const refreshToken = UserController.generateRefreshToken(user);
                        refreshTokens.push(refreshToken);
                        res.cookie("refreshToken", refreshToken, {
                            httpOnly: true,
                            secure: false,
                            path: '/',
                            sameSite: 'strict',
                        });
                        const { pin, __v, ...others } = user._doc;
                        buildProdLogger('info', 'login_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                        return res.status(200).json({
                            message: "Login successfully",
                            data: { ...others },
                            token: accessToken,
                            status: true,
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone and pin code. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOtp: async (req, res, next) => {
        try {
            let OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            let PHONE = req.body.phone;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '') {
                    const dataTemp = new Otp({ phone: PHONE, otp: OTP });
                    await dataTemp.save((err) => {
                        if (!err) {
                            return res.status(200).json({
                                message: "Send otp successfully",
                                otp: OTP,
                                status: true
                            });
                        }
                        else {
                            return res.status(200).json({
                                message: "Send otp failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        }
                    });
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone. Do not leave any field blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtp: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let OTP = req.body.otp;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                    const otpUser = await Otp.find({ phone: PHONE });
                    if (otpUser.length === 0) {
                        return res.status(200).json({
                            message: "Expired otp. Please resend otp !",
                            status: false
                        });
                    }
                    else {
                        const lastOtp = otpUser[otpUser.length - 1];
                        if (lastOtp.phone === PHONE && lastOtp.otp === OTP) {
                            await Otp.deleteMany({ phone: lastOtp.phone })
                                .then(async (data, err) => {
                                    if (!err) {
                                        const users = await Customer.find();
                                        const user = users.find(x => x.phone === PHONE);
                                        if (user) {
                                            user.step = 4;
                                            await user.save()
                                                .then((data) => {
                                                    return res.status(200).json({
                                                        message: "Successfully. OTP valid",
                                                        status: true,
                                                    })
                                                })
                                                .catch((err) => {
                                                    return res.status(200).json({
                                                        errorStatus: err.status || 500,
                                                        errorMessage: err.message,
                                                        status: false,
                                                    })
                                                })
                                        }
                                    }
                                })
                        }
                        else {
                            return res.status(200).json({
                                message: "Failure. OTP invalid",
                                status: false,
                            })
                        }
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone and otp code. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOtpPin: async (req, res, next) => {
        try {
            let OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            let PHONE = req.body.phone;
            let NID = req.body.nid;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '') {
                    const phones = await Customer.find();
                    const validPhone = phones.find(x => x.phone === PHONE);
                    if (validPhone) {
                        const nids = await Personal.find();
                        const validNid = nids.find(x => x.citizenId === NID);
                        if (validNid && validPhone.phone === validNid.phone) {
                            const dataTemp = new Otp({ phone: PHONE, otp: OTP, nid: NID });
                            await dataTemp.save((err) => {
                                if (!err) {
                                    return res.status(200).json({
                                        message: "Send otp successfully",
                                        otp: OTP,
                                        status: true
                                    });
                                }
                                else {
                                    return res.status(200).json({
                                        message: "Send otp failure",
                                        status: false,
                                        errorStatus: err.status || 500,
                                        errorMessage: err.message
                                    });
                                }
                            });
                        }
                        else {
                            return res.status(200).json({
                                message: "Wrong nid. Please try again !",
                                status: false
                            });
                        }
                    }
                    else {
                        return res.status(200).json({
                            message: "Wrong phone. Please try again !",
                            status: false
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone number and nid. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtpPin: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let NID = req.body.nid;
            let OTP = req.body.otp;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '' && OTP !== null && OTP !== '') {
                    const validUser = await Otp.find({ phone: PHONE, nid: NID });
                    if (validUser.length === 0) {
                        return res.status(200).json({
                            message: "Expired otp. Please resend otp !",
                            status: false
                        });
                    }
                    else {
                        const lastOtp = validUser[validUser.length - 1];
                        if (lastOtp.phone === PHONE && lastOtp.nid === NID && lastOtp.otp === OTP) {
                            const accessToken = UserController.generateAccessToken(lastOtp);
                            await Otp.deleteMany({ phone: PHONE, nid: NID });
                            return res.status(200).json({
                                message: "Successfully. OTP valid",
                                token: accessToken,
                                status: true,
                            })
                        }
                        else {
                            return res.status(401).json({
                                message: "Failure. OTP invalid",
                                status: false,
                            })
                        }
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone, nid and otp code. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    resetPin: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let NEW_PIN = req.body.new_pin;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && NEW_PIN !== null && NEW_PIN !== '') {
                    const users = await Customer.find();
                    const user = users.find(x => x.phone === PHONE);
                    if (user) {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(NEW_PIN, salt);
                        user.pin = hashed;
                        await user.save()
                            .then((data) => {
                                buildProdLogger('info', 'reset_pin_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                return res.status(200).json({
                                    message: "Reset pin successfully",
                                    status: true
                                })
                            })
                            .catch((err) => {
                                buildProdLogger('error', 'reset_pin_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                return res.status(200).json({
                                    message: "Reset pin failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message,
                                })
                            })
                    }
                    else {
                        return res.status(200).json({
                            message: "This account is not exists !"
                        })
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone and new pin code. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    updatePin: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let PIN = req.body.pin;
            let NEW_PIN = req.body.new_pin;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(200).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '' && NEW_PIN !== null && NEW_PIN !== '') {
                    const users = await Customer.find();
                    const user = users.find(x => x.phone === PHONE);
                    if (user) {
                        const validPin = await bcrypt.compare(PIN, user.pin);
                        if (validPin) {
                            const salt = await bcrypt.genSalt(10);
                            const hashed = await bcrypt.hash(NEW_PIN, salt);
                            user.pin = hashed;
                            await user.save()
                                .then((data) => {
                                    buildProdLogger('info', 'update_pin_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                    return res.status(201).json({
                                        message: "Update pin successfully",
                                        status: true
                                    })
                                })
                                .catch((err) => {
                                    buildProdLogger('error', 'update_pin_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                    return res.status(200).json({
                                        message: "Update pin failure",
                                        status: false,
                                        errorStatus: err.status || 500,
                                        errorMessage: err.message
                                    })
                                })
                        }
                        else {
                            return res.status(200).json({
                                message: "Your old pin is not correct !",
                                status: false
                            })
                        }
                    }
                    else {
                        return res.status(200).json({
                            message: "This account is not exists !",
                            status: false
                        })
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Please enter your phone, old pin code and new pin code. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllUser: async (req, res, next) => {
        try {
            const users = await Customer.find();
            let result = [];
            users.map((user, index) => {
                let { pin, __v, ...others } = user._doc;
                result.push({ ...others });
            });
            if (users.length > 0) {
                return res.status(200).json({
                    count: users.length,
                    data: result,
                    message: "Get list user success",
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "List user is empty ",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

};

module.exports = UserController;