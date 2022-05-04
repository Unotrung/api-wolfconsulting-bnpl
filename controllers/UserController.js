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

const UserController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "40m" }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "3h" }
        );
    },

    checkPhoneExists: async (req, res, next) => {
        try {
            let phone = req.body.phone;
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
                        status: true,
                        errCode: 1000
                    });
                }
                else if (phone.startsWith('033')) {
                    return res.status(404).json({
                        message: "This phone number is not exists in EAP !",
                        status: false,
                        errCode: 1001
                    });
                }
                else if (phone.startsWith('044')) {
                    return res.status(404).json({
                        message: "This phone number is not exists in BNPL !",
                        status: false,
                        errCode: 1002
                    });
                }
                else if (phone === "0312312399") {
                    return res.status(403).json({
                        message: "This phone is block. Please contact for help !",
                        status: false,
                        errCode: 1004,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "This phone number is not exists !",
                        status: false,
                        step: 1,
                        errCode: 1003
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone. Do not leave any field blank !",
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
                        message: "This nid is already exists !",
                        status: true,
                        statusCode: 1000
                    });
                }
                else {
                    return res.status(404).json({
                        message: "This nid is not exists !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your nid. Do not leave any field blank !",
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
                        message: "This nid and phone is already exists !",
                        status: true,
                        statusCode: 1000
                    });
                }
                else {
                    return res.status(404).json({
                        message: "This nid and phone is not exists !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your nid and phone. Do not leave any field blank !",
                    status: false,
                    statusCode: 1005
                });
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
            if (PHONE !== null && PHONE !== '') {
                const blacklists = await Blacklists.find();
                const isExists = blacklists.find(x => x.phone === PHONE);
                if (isExists) {
                    if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                        return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004 });
                    }
                    else if (isExists.lockUntil && isExists.lockUntil < Date.now()) {
                        await Blacklists.deleteMany({ phone: PHONE })
                        let dataTemp = new Otp({ phone: PHONE, otp: OTP, expiredAt: Date.now() + 1 * 60 * 1000 });
                        await dataTemp.save((err) => {
                            if (!err) {
                                return res.status(200).json({
                                    message: "Send otp successfully",
                                    otp: OTP,
                                    status: true
                                });
                            }
                            else {
                                return res.status(409).json({
                                    message: "Send otp failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                });
                            }
                        });
                    }
                }
                else {
                    let dataTemp = new Otp({ phone: PHONE, otp: OTP, expiredAt: Date.now() + 1 * 60 * 1000 });
                    await dataTemp.save((err) => {
                        if (!err) {
                            return res.status(200).json({
                                message: "Send otp successfully",
                                otp: OTP,
                                status: true
                            });
                        }
                        else {
                            return res.status(409).json({
                                message: "Send otp failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        }
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone. Do not leave any field blank !",
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
            if (PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                const otpUser = await Otp.find({ phone: PHONE });
                if (otpUser.length === 0) {
                    return res.status(401).json({
                        message: "Expired otp. Please resend otp !",
                        status: false,
                        statusCode: 3000
                    });
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ phone: lastOtp.phone })
                        return res.status(401).json({
                            message: "Expired otp. Please resend otp !",
                            status: false,
                            statusCode: 3000
                        });
                    }
                    else {
                        if (lastOtp.phone === PHONE && lastOtp.otp === OTP) {
                            await Otp.deleteMany({ phone: lastOtp.phone })
                                .then(async (data, err) => {
                                    if (!err) {
                                        const users = await Customer.find();
                                        const user = users.find(x => x.phone === PHONE);
                                        if (user) {
                                            user.step = 3;
                                            await user.save()
                                                .then((data) => {
                                                    return res.status(200).json({
                                                        message: "Successfully. OTP valid",
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
                            const blacklists = await Blacklists.find();
                            const isExists = blacklists.find(x => x.phone === PHONE);
                            if (isExists) {
                                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                                    return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004 });
                                }
                                else if (isExists.attempts < 5) {
                                    await isExists.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { attempts: 1 } });
                                    return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure ${isExists.attempts + 1} times !`, status: false, statusCode: 4000, countFail: isExists.attempts + 1 });
                                }
                            }
                            else {
                                const blackPhone = await new Blacklists({ phone: PHONE, attempts: 1, lockUntil: Date.now() + 24 * 60 * 60 * 1000 });
                                await blackPhone.save((err) => {
                                    if (!err) {
                                        return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure 1 times !`, status: false, statusCode: 4000, countFail: 1 });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone and otp code. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
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
            if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '') {
                const blacklists = await Blacklists.find();
                const isExists = blacklists.find(x => x.phone === PHONE);
                if (isExists) {
                    if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                        return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004 });
                    }
                    else if (isExists.lockUntil && isExists.lockUntil < Date.now()) {
                        await Blacklists.deleteMany({ phone: PHONE })
                        let phones = await Customer.find();
                        let validPhone = phones.find(x => x.phone === PHONE);
                        if (validPhone) {
                            let nids = await Personal.find();
                            let validNid = nids.find(x => x.citizenId === NID);
                            if (validNid && validPhone.phone === validNid.phone) {
                                let dataTemp = new Otp({ phone: PHONE, otp: OTP, nid: NID, expiredAt: Date.now() + 1 * 60 * 1000 });
                                await dataTemp.save((err) => {
                                    if (!err) {
                                        return res.status(200).json({
                                            message: "Send otp successfully",
                                            otp: OTP,
                                            status: true
                                        });
                                    }
                                    else {
                                        return res.status(409).json({
                                            message: "Send otp failure",
                                            status: false,
                                            errorStatus: err.status || 500,
                                            errorMessage: err.message
                                        });
                                    }
                                });
                            }
                            else {
                                return res.status(404).json({
                                    message: "Wrong nid. Please try again !",
                                    status: false,
                                    statusCode: 1001
                                });
                            }
                        }
                        else {
                            return res.status(404).json({
                                message: "Wrong phone. Please try again !",
                                status: false,
                                statusCode: 1002
                            });
                        }
                    }
                }
                else {
                    let phones = await Customer.find();
                    let validPhone = phones.find(x => x.phone === PHONE);
                    if (validPhone) {
                        let nids = await Personal.find();
                        let validNid = nids.find(x => x.citizenId === NID);
                        if (validNid && validPhone.phone === validNid.phone) {
                            let dataTemp = new Otp({ phone: PHONE, otp: OTP, nid: NID, expiredAt: Date.now() + 1 * 60 * 1000 });
                            await dataTemp.save((err) => {
                                if (!err) {
                                    return res.status(200).json({
                                        message: "Send otp successfully",
                                        otp: OTP,
                                        status: true
                                    });
                                }
                                else {
                                    return res.status(409).json({
                                        message: "Send otp failure",
                                        status: false,
                                        errorStatus: err.status || 500,
                                        errorMessage: err.message
                                    });
                                }
                            });
                        }
                        else {
                            return res.status(404).json({
                                message: "Wrong nid. Please try again !",
                                status: false,
                                statusCode: 1001
                            });
                        }
                    }
                    else {
                        return res.status(404).json({
                            message: "Wrong phone. Please try again !",
                            status: false,
                            statusCode: 1002
                        });
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone number and nid. Do not leave any fields blank !",
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
            if (PHONE !== null && PHONE !== '' && NID !== null && NID !== '' && OTP !== null && OTP !== '') {
                const validUser = await Otp.find({ phone: PHONE, nid: NID });
                if (validUser.length === 0) {
                    return res.status(401).json({
                        message: "Expired otp. Please resend otp !",
                        status: false,
                        statusCode: 3000
                    });
                }
                else {
                    const lastOtp = validUser[validUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ phone: PHONE, nid: NID });
                        return res.status(401).json({
                            message: "Expired otp. Please resend otp !",
                            status: false,
                            statusCode: 3000
                        });
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
                            await Otp.deleteMany({ phone: PHONE, nid: NID });
                            return res.status(200).json({
                                message: "Successfully. OTP valid",
                                token: accessToken,
                                status: true,
                            })
                        }
                        else {
                            const blacklists = await Blacklists.find();
                            const isExists = blacklists.find(x => x.phone === PHONE);
                            if (isExists) {
                                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                                    return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004 });
                                }
                                else if (isExists.attempts < 5) {
                                    await isExists.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { attempts: 1 } });
                                    return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure ${isExists.attempts + 1} times !`, status: false, statusCode: 4000, countFail: isExists.attempts + 1 });
                                }
                            }
                            else {
                                const blackPhone = await new Blacklists({ phone: PHONE, attempts: 1, lockUntil: Date.now() + 24 * 60 * 60 * 1000 });
                                await blackPhone.save((err) => {
                                    if (!err) {
                                        return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure 1 times !`, status: false, statusCode: 4000, countFail: 1 });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone, nid and otp code. Do not leave any fields blank !",
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
                    return res.status(403).json({ message: "This phone is blocked by admin", status: false, statusCode: 1001 });
                }
                const users = await Customer.find();
                const user = users.find(x => x.phone === PHONE);
                if (!user) {
                    return res.status(404).json({ message: "Wrong phone. Please try again !", status: false, statusCode: 1002 });
                }
                else if (user) {
                    if (user.lockUntil && user.lockUntil < Date.now()) {
                        await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } })
                    }
                }
                const valiPin = await bcrypt.compare(PIN, user.pin);
                if (!valiPin) {
                    if (user.loginAttempts === 5 && user.lockUntil > Date.now()) {
                        return res.status(404).json({ message: "You are logged in failure 5 times. Please wait 24 hours to login again !", status: false, statusCode: 1004 });
                    }
                    else if (user.loginAttempts < 5) {
                        await user.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { loginAttempts: 1 } });
                        return res.status(404).json({ message: `Wrong pin. You are logged in failure ${user.loginAttempts + 1} times !`, status: false, statusCode: 1003, countFail: user.loginAttempts + 1 });
                    }
                }
                if (user && valiPin && user.loginAttempts !== 5) {
                    await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } })
                    const accessToken = UserController.generateAccessToken(user);
                    const refreshToken = UserController.generateRefreshToken(user);
                    user.refreshToken = refreshToken;
                    await user.save()
                        .then((data) => {
                            const { pin, __v, ...others } = data._doc;
                            return res.status(200).json({
                                message: "Login successfully",
                                data: { ...others },
                                token: accessToken,
                                status: true
                            });
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: "Login failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        })
                }
                else {
                    return res.status(403).json({ message: "You are logged in failure 5 times. Please wait 24 hours to login again !", status: false });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone and pin code. Do not leave any fields blank !",
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
            let phone = req.body.phone;
            let id = req.body.id;
            let refreshToken = req.body.refreshToken;
            if (refreshToken !== null && refreshToken !== '' && id !== null && id !== '' && phone !== null && phone !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.refreshToken === refreshToken && x.id === id && x.phone === phone);
                if (customer) {
                    let newAccessToken = UserController.generateAccessToken(customer);
                    let newRefreshToken = UserController.generateRefreshToken(customer);
                    customer.refreshToken = newRefreshToken;
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: 'Update refreshToken successfully',
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: 'Update refreshToken failure',
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(409).json({
                        message: "Can not find this account to update !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your id, refreshToken, phone. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    logout: async (req, res, next) => {
        try {
            let id = req.body.id;
            let phone = req.body.phone;
            if (id !== null && id !== '' && phone !== null && phone !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.id === id && x.phone === phone);
                if (customer) {
                    customer.refreshToken = null;
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: 'Log out successfully',
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: 'Log out failure',
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(409).json({
                        message: "Can not find this account to log out !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your id and phone. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
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
                            return res.status(409).json({
                                message: "Reset pin failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message,
                            })
                        })
                }
                else {
                    return res.status(404).json({
                        message: "This account is not exists !",
                        status: false,
                        statusCode: 900
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone and new pin code. Do not leave any fields blank !",
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
                const users = await Customer.find();
                const user = users.find(x => x.phone === PHONE);
                if (user) {
                    const validPin = await bcrypt.compare(PIN, user.pin);
                    if (validPin) {
                        if (PIN === NEW_PIN) {
                            return res.status(400).json({ message: "Old password and new password are the same. Please try again !", status: false, statusCode: 1006 });
                        }
                        else {
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
                                    return res.status(409).json({
                                        message: "Update pin failure",
                                        status: false,
                                        errorStatus: err.status || 500,
                                        errorMessage: err.message
                                    })
                                })
                        }
                    }
                    else {
                        return res.status(404).json({
                            message: "Your old pin is not correct !",
                            status: false,
                            statusCode: 1001
                        })
                    }
                }
                else {
                    return res.status(404).json({
                        message: "This account is not exists !",
                        status: false,
                        statusCode: 1002
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone, old pin code and new pin code. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
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
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    updateESignUser: async (req, res, next) => {
        try {
            if (req.error) {
                return res.status(401).json({
                    message: 'You are not authorize'
                })
            }
            const { id, tenors, credit_limit, name } = req.body
            if (!id || !credit_limit || !name || tenors.length === 0) {
                return res.status(400).json({
                    message: 'Bad request'
                })
            }
            const customers = await Customer.find()
            const user = customers.find(customer => customer._id === id)
            if (!user) return res.status(400).json({
                message: 'Bad request'
            })
            //todo: update user status esign confirm here

            //public an event
            await pubsub.publish('new_user_event', { newUserEvent: { id, name, credit_limit } })
        }
        catch (e) {
            next(e)
        }
    }

};

module.exports = UserController;
