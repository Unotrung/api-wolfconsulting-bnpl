const Customer = require('../models/bnpl_customers');
const Personal = require('../models/bnpl_personals');
const Otp = require('../models/bnpl_otps');
const Blacklists = require('../models/bnpl_blacklists');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { buildProdLogger } = require('../helpers/logger');
const { v4: uuid } = require('uuid');
const pubsub = require('../utils/pubsub');
const { MSG_GET_LIST_SUCCESS, MSG_LIST_IS_EMPTY, MSG_PERSONAL_IS_NOT_EXISTS, MSG_ENTER_ALL_FIELDS,
    MSG_UPDATE_SUCCESSFULLY, MSG_UPDATE_FAILURE, MSG_PHONE_IS_NOT_EXISTS_IN_EAP, MSG_PHONE_IS_NOT_EXISTS_IN_BNPL,
    MSG_PHONE_IS_EXISTS, MSG_PHONE_IS_NOT_EXISTS, MSG_VERIFY_OTP_FAILURE_5_TIMES, MSG_LOGIN_FAILURE_5_TIMES, MSG_NID_IS_EXISTS, MSG_NID_IS_NOT_EXISTS,
    MSG_NID_AND_PHONE_IS_EXISTS, MSG_NID_AND_PHONE_IS_NOT_EXISTS, MSG_OLD_NEW_PASSWORD_IS_SAME, MSG_OLD_PIN_IS_NOT_CORRECT,
    MSG_PHONE_IS_BLOCKED_BY_ADMIN, MSG_LOGIN_SUCCESSFULLY, MSG_LOGIN_FAILURE, MSG_WRONG_PHONE, MSG_WRONG_PIN, MSG_SEND_OTP_SUCCESSFULLY,
    MSG_SEND_OTP_FAILURE, MSG_OTP_EXPIRED, MSG_OTP_VALID, MSG_OTP_INVALID, MSG_WRONG_NID
} = require('../config/response/response');

const UserController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '30m' }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '3h' }
        );
    },

    findUserInBlacklists: async (phone) => {
        const blacklists = await Blacklists.find();
        return blacklists.find(x => x.phone === phone);
    },

    findUserInCustomers: async (phone) => {
        const users = await Customer.find();
        return users.find(x => x.phone === phone);
    },

    checkPhoneExists: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            if (phone !== null && phone !== '') {
                const isExists = await UserController.findUserInBlacklists(phone);
                const user = await UserController.findUserInCustomers(phone);
                var result = {
                    data: {
                        _id: user?.id,
                        phone: user?.phone,
                        step: user?.step
                    },
                    message: MSG_PHONE_IS_EXISTS,
                    status: true,
                    errCode: 1000
                };
                if (isExists) {
                    if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, errCode: 1008, countFail: 5 });
                    }
                    else if ((isExists.lockUntil && isExists.lockUntil < Date.now()) || (isExists.attempts > 0 && isExists.attempts < 5)) {
                        await Blacklists.deleteMany({ phone: phone });
                        return res.status(200).json(result);
                    }
                }
                else {
                    if (user?.loginAttempts === 5 && user?.lockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_LOGIN_FAILURE_5_TIMES, status: false, countFail: 5, errCode: 1004 });
                    }
                    else if (user) {
                        return res.status(200).json(result);;
                    }
                    else {
                        return res.status(404).json({
                            message: MSG_PHONE_IS_NOT_EXISTS,
                            status: false,
                            step: 1,
                            errCode: 1003
                        });
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    errCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkNidExists: async (req, res, next) => {
        try {
            let nid = req.body.nid;
            if (nid !== null && nid !== '') {
                const users = await Personal.find();
                const user = users.find(x => x.citizenId === nid);
                if (user) {
                    return res.status(200).json({
                        data: {
                            _id: user.id,
                            nid: user.citizenId
                        },
                        message: MSG_NID_IS_EXISTS,
                        status: true,
                        statusCode: 1000
                    });
                }
                else {
                    return res.status(404).json({
                        message: MSG_NID_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkNidPhoneExists: async (req, res, next) => {
        try {
            let nid = req.body.nid;
            let phone = req.body.phone;
            if (nid !== null && nid !== '' && phone !== null && phone !== '') {
                const users = await Personal.find();
                const user = users.find(x => x.citizenId === nid && x.phone === phone);
                if (user) {
                    return res.status(200).json({
                        data: {
                            _id: user.id,
                            nid: user.citizenId,
                            phone: user.phone
                        },
                        message: MSG_NID_AND_PHONE_IS_EXISTS,
                        status: true,
                        statusCode: 1000
                    });
                }
                else {
                    return res.status(404).json({
                        message: MSG_NID_AND_PHONE_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    generateOTP: (PHONE, OTP) => {
        return async (req, res) => {
            if (PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                let dataTemp = new Otp({ phone: PHONE, otp: OTP, expiredAt: Date.now() + 1 * 60 * 1000 });
                await dataTemp.save((err) => {
                    if (!err) {
                        return res.status(200).json({
                            message: MSG_SEND_OTP_SUCCESSFULLY,
                            otp: OTP,
                            status: true
                        });
                    }
                    else {
                        return res.status(409).json({
                            message: MSG_SEND_OTP_FAILURE,
                            status: false,
                            errorStatus: err.status || 500,
                            errorMessage: err.message
                        });
                    }
                });
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
    },

    sendOtp: async (req, res, next) => {
        try {
            let OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            let PHONE = req.body.phone;
            if (PHONE !== null && PHONE !== '') {
                const isExists = await UserController.findUserInBlacklists(PHONE);
                if (isExists) {
                    if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, countFail: 5, statusCode: 1004 });
                    }
                    else if ((isExists.lockUntil && isExists.lockUntil < Date.now()) || (isExists.attempts > 0 && isExists.attempts < 5)) {
                        await Blacklists.deleteMany({ phone: PHONE });
                        await UserController.generateOTP(PHONE, OTP)(req, res);
                    }
                }
                else {
                    await UserController.generateOTP(PHONE, OTP)(req, res);
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
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
            let otp_expired = {
                message: MSG_OTP_EXPIRED,
                status: false,
                statusCode: 3000
            };
            if (PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                const otpUser = await Otp.find({ phone: PHONE });
                if (otpUser.length === 0) {
                    return res.status(401).json(otp_expired);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ phone: lastOtp.phone });
                        return res.status(401).json(otp_expired);
                    }
                    else {
                        if (lastOtp.phone === PHONE && lastOtp.otp === OTP) {
                            await Blacklists.deleteMany({ phone: PHONE });
                            await Otp.deleteMany({ phone: lastOtp.phone })
                                .then(async (data, err) => {
                                    if (!err) {
                                        const user = await UserController.findUserInCustomers(PHONE);
                                        if (user) {
                                            user.step = 3;
                                            await user.save()
                                                .then((data) => {
                                                    return res.status(200).json({
                                                        message: MSG_OTP_VALID,
                                                        status: true,
                                                    })
                                                })
                                                .catch((err) => {
                                                    return res.status(409).json({
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
                            const isExists = await UserController.findUserInBlacklists(PHONE);
                            if (isExists) {
                                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, countFail: 5, statusCode: 1004 });
                                }
                                else if (isExists.attempts > 0 && isExists.attempts < 5) {
                                    await isExists.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { attempts: 1 } });
                                    return res.status(404).json({ message: MSG_OTP_INVALID, status: false, statusCode: 4000, countFail: isExists.attempts + 1 });
                                }
                            }
                            else {
                                const blackPhone = await new Blacklists({ phone: PHONE, attempts: 1, lockUntil: Date.now() + 24 * 60 * 60 * 1000 });
                                await blackPhone.save((err) => {
                                    if (!err) {
                                        return res.status(404).json({ message: MSG_OTP_INVALID, status: false, statusCode: 4000, countFail: 1 });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    generateOTPPin: (PHONE, NID, OTP) => {
        return async (req, res) => {
            if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '' && OTP !== null && OTP !== '') {
                let validPhone = await UserController.findUserInCustomers(PHONE);
                if (validPhone) {
                    let nids = await Personal.find();
                    let validNid = nids.find(x => x.citizenId === NID);
                    if (validNid && validPhone.phone === validNid.phone) {
                        let dataTemp = new Otp({ phone: PHONE, otp: OTP, nid: NID, expiredAt: Date.now() + 1 * 60 * 1000 });
                        await dataTemp.save((err) => {
                            if (!err) {
                                return res.status(200).json({
                                    message: MSG_SEND_OTP_SUCCESSFULLY,
                                    otp: OTP,
                                    status: true
                                });
                            }
                            else {
                                return res.status(409).json({
                                    message: MSG_SEND_OTP_FAILURE,
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                });
                            }
                        });
                    }
                    else {
                        return res.status(404).json({
                            message: MSG_WRONG_NID,
                            status: false,
                            statusCode: 1001
                        });
                    }
                }
                else {
                    return res.status(404).json({
                        message: MSG_WRONG_PHONE,
                        status: false,
                        statusCode: 1002
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
    },

    sendOtpPin: async (req, res, next) => {
        try {
            let OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            let PHONE = req.body.phone;
            let NID = req.body.nid;
            if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '') {
                const isExists = await UserController.findUserInBlacklists(PHONE);
                if (isExists) {
                    if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, countFail: 5, statusCode: 1004 });
                    }
                    else if ((isExists.lockUntil && isExists.lockUntil < Date.now()) || (isExists.attempts > 0 && isExists.attempts < 5)) {
                        await Blacklists.deleteMany({ phone: PHONE })
                        await UserController.generateOTPPin(PHONE, NID, OTP)(req, res);
                    }
                }
                else {
                    await UserController.generateOTPPin(PHONE, NID, OTP)(req, res);
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
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
            let expired_otp = {
                message: MSG_OTP_EXPIRED,
                status: false,
                statusCode: 3000
            }
            if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '' && OTP !== null && OTP !== '') {
                const validUser = await Otp.find({ phone: PHONE, nid: NID });
                if (validUser.length === 0) {
                    return res.status(401).json(expired_otp);
                }
                else {
                    const lastOtp = validUser[validUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ phone: PHONE, nid: NID });
                        return res.status(401).json(expired_otp);
                    }
                    else {
                        if (lastOtp.phone === PHONE && lastOtp.nid === NID && lastOtp.otp === OTP) {
                            const accessToken = jwt.sign(
                                {
                                    id: lastOtp.id,
                                    phone: lastOtp.phone
                                },
                                process.env.JWT_ACCESS_KEY,
                                { expiresIn: "1m" }
                            );
                            await Blacklists.deleteMany({ phone: PHONE });
                            await Otp.deleteMany({ phone: PHONE, nid: NID });
                            return res.status(200).json({
                                message: MSG_OTP_VALID,
                                token: accessToken,
                                status: true,
                            })
                        }
                        else {
                            const isExists = await UserController.findUserInBlacklists(PHONE);
                            if (isExists) {
                                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, countFail: 5, statusCode: 1004 });
                                }
                                else if (isExists.attempts < 5) {
                                    await isExists.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { attempts: 1 } });
                                    return res.status(404).json({ message: MSG_OTP_INVALID, status: false, statusCode: 4000, countFail: isExists.attempts + 1 });
                                }
                            }
                            else {
                                const blackPhone = await new Blacklists({ phone: PHONE, attempts: 1, lockUntil: Date.now() + 24 * 60 * 60 * 1000 });
                                await blackPhone.save((err) => {
                                    if (!err) {
                                        return res.status(404).json({ message: MSG_OTP_INVALID, status: false, statusCode: 4000, countFail: 1 });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
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
            if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '') {
                const deletedUser = await Customer.findDeleted();
                const isBlock = deletedUser.find(x => x.deleted === Boolean(true) && x.deletedAt !== null);
                if (isBlock) {
                    return res.status(403).json({ message: MSG_PHONE_IS_BLOCKED_BY_ADMIN, status: false, statusCode: 1001 });
                }
                const user = await UserController.findUserInCustomers(PHONE);
                if (!user) {
                    return res.status(404).json({ message: MSG_WRONG_PHONE, status: false, statusCode: 1002 });
                }
                else if (user) {
                    if (user?.lockUntil && user?.lockUntil < Date.now()) {
                        await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } })
                    }
                }
                const valiPin = await bcrypt.compare(PIN, user.pin);
                if (!valiPin) {
                    if (user?.loginAttempts === 5 && user?.lockUntil > Date.now()) {
                        return res.status(404).json({ message: MSG_LOGIN_FAILURE_5_TIMES, status: false, countFail: 5, statusCode: 1004 });
                    }
                    else if (user?.loginAttempts < 5) {
                        await user.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { loginAttempts: 1 } });
                        return res.status(404).json({ message: MSG_WRONG_PIN, status: false, statusCode: 1003, countFail: user.loginAttempts + 1 });
                    }
                }
                if (user && valiPin && user.loginAttempts !== 5) {
                    await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } })
                    const accessToken = UserController.generateAccessToken(user);
                    const refreshToken = UserController.generateRefreshToken(user);
                    user.refreshToken = refreshToken;
                    await user.save()
                        .then((data) => {
                            const { pin, loginAttempts, deleted, __v, ...others } = data._doc;
                            return res.status(200).json({
                                message: MSG_LOGIN_SUCCESSFULLY,
                                data: { ...others },
                                token: accessToken,
                                status: true
                            });
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_LOGIN_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        })
                }
                else {
                    return res.status(403).json({ message: MSG_LOGIN_FAILURE_5_TIMES, countFail: 5, status: false, statusCode: 1004 });
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    requestRefreshToken: async (req, res, next) => {
        try {
            let refreshToken = req.body.refreshToken;
            if (refreshToken !== null && refreshToken !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.refreshToken === refreshToken);
                if (customer) {
                    let newAccessToken = UserController.generateAccessToken(customer);
                    let newRefreshToken = UserController.generateRefreshToken(customer);
                    customer.refreshToken = newRefreshToken;
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(409).json({
                        message: MSG_PERSONAL_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    // logout: async (req, res, next) => {
    //     try {
    //         let id = req.body.id;
    //         let phone = req.body.phone;
    //         if (id !== null && id !== '' && phone !== null && phone !== '') {
    //             const customers = await Customer.find();
    //             const customer = customers.find(x => x.id === id && x.phone === phone);
    //             if (customer) {
    //                 customer.refreshToken = null;
    //                 await customer.save()
    //                     .then((data) => {
    //                         return res.status(201).json({
    //                             message: 'Log out successfully',
    //                             status: true
    //                         })
    //                     })
    //                     .catch((err) => {
    //                         return res.status(409).json({
    //                             message: 'Log out failure',
    //                             status: false,
    //                             errorStatus: err.status || 500,
    //                             errorMessage: err.message
    //                         })
    //                     })
    //             }
    //             else {
    //                 return res.status(409).json({
    //                     message: "Can not find this account to log out !",
    //                     status: false,
    //                     statusCode: 900
    //                 });
    //             }
    //         }
    //         else {
    //             return res.status(400).json({
    //                 message: "Please enter your id and phone. Do not leave any fields blank !",
    //                 status: false,
    //                 statusCode: 1005
    //             });
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    encryptPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    },

    resetPin: async (req, res, next) => {
        try {
            let PHONE = req.body.phone;
            let NEW_PIN = req.body.new_pin;
            if (PHONE !== null && PHONE !== '' && NEW_PIN !== null && NEW_PIN !== '') {
                const user = await UserController.findUserInCustomers(PHONE);
                if (user) {
                    const hashed = await UserController.encryptPassword(NEW_PIN);
                    user.pin = hashed;
                    await user.save()
                        .then((data) => {
                            buildProdLogger('info', 'reset_pin_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                            return res.status(200).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                status: true
                            })
                        })
                        .catch((err) => {
                            buildProdLogger('error', 'reset_pin_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message,
                            })
                        })
                }
                else {
                    return res.status(404).json({
                        message: MSG_PERSONAL_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
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
            if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '' && NEW_PIN !== null && NEW_PIN !== '') {
                const user = await UserController.findUserInCustomers(PHONE);
                if (user) {
                    const validPin = await bcrypt.compare(PIN, user.pin);
                    if (validPin) {
                        if (PIN === NEW_PIN) {
                            return res.status(400).json({ message: MSG_OLD_NEW_PASSWORD_IS_SAME, status: false, statusCode: 1006 });
                        }
                        else {
                            const hashed = await UserController.encryptPassword(NEW_PIN);
                            user.pin = hashed;
                            await user.save()
                                .then((data) => {
                                    buildProdLogger('info', 'update_pin_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                    return res.status(201).json({
                                        message: MSG_UPDATE_SUCCESSFULLY,
                                        status: true
                                    })
                                })
                                .catch((err) => {
                                    buildProdLogger('error', 'update_pin_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${PHONE}`);
                                    return res.status(409).json({
                                        message: MSG_UPDATE_FAILURE,
                                        status: false,
                                        errorStatus: err.status || 500,
                                        errorMessage: err.message
                                    })
                                })
                        }
                    }
                    else {
                        return res.status(404).json({
                            message: MSG_OLD_PIN_IS_NOT_CORRECT,
                            status: false,
                            statusCode: 1001
                        })
                    }
                }
                else {
                    return res.status(404).json({
                        message: MSG_PERSONAL_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 1002
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    // getAllUser: async (req, res, next) => {
    //     try {
    //         const users = await Customer.find();
    //         let result = [];
    //         users.map((user, index) => {
    //             let { pin, __v, loginAttempts, refreshToken, deleted, ...others } = user._doc;
    //             result.push({ ...others });
    //         });
    //         if (users.length > 0) {
    //             return res.status(200).json({
    //                 count: users.length,
    //                 data: result,
    //                 message: MSG_GET_LIST_SUCCESS,
    //                 status: true
    //             })
    //         }
    //         else {
    //             return res.status(200).json({
    //                 message: MSG_LIST_IS_EMPTY,
    //                 status: true
    //             })
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

};

module.exports = UserController;
