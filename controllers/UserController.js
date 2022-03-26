const Customer = require('../models/bnpl_customers');
const Personal = require('../models/bnpl_personals');
const Otp = require('../models/bnpl_otps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

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
            if (phone !== null && phone !== '') {
                const user = await Customer.findOne({ phone: phone });
                if (user) {
                    return res.status(200).json({
                        data: {
                            _id: user.id,
                            phone: user.phone
                        },
                        message: "This phone number is already exists !",
                        isExists: true
                    });
                }
                else if (phone.startsWith('033')) {
                    return res.status(200).json({
                        message: "This phone number is not exists in EAP !",
                        isExists: false,
                        errCode: 1001,
                    });
                }
                else if (phone.startsWith('044')) {
                    return res.status(200).json({
                        message: "This phone number is not exists in BNPL !",
                        isExists: false,
                        errCode: 1002,
                    });
                }
            }
            else {
                return res.status(200).json({
                    message: "Please enter the phone number !",
                    status: false
                });
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
            if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '') {
                const auth = await Customer.findOne({ phone: req.body.phone });
                if (auth) {
                    return res.status(200).json({
                        message: "This account is already exists ! Please Login",
                    });
                }
                else {
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(PIN, salt);
                    const user = await new Customer({ phone: PHONE, pin: hashed });
                    const accessToken = UserController.generateAccessToken(user);
                    const result = await user.save((err, data) => {
                        if (!err) {
                            const { pin, ...others } = data._doc;
                            return res.status(201).json({
                                message: "Register Successfully",
                                data: { ...others },
                                token: accessToken,
                                status: true
                            });
                        }
                        else {
                            return res.status(400).json({
                                message: "Register Failure",
                                status: false
                            });
                        }
                    });
                }
            }
            else {
                return res.status(200).json({
                    message: "Please enter your phone number and pin code. Do not leave any fields blank !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const PHONE = req.body.phone;
            const PIN = req.body.pin;
            if (PHONE !== null && PHONE !== '' && PIN !== null && PIN !== '') {
                const user = await Customer.findOne({ phone: PHONE });
                if (!user) {
                    return res.status(200).json({ message: "Wrong phone. Please Try Again !", status: false });
                }
                const valiPin = await bcrypt.compare(PIN, user.pin);
                if (!valiPin) {
                    return res.status(200).json({ message: "Wrong pin. Please Try Again !", status: false });
                }
                if (user && valiPin) {
                    const accessToken = UserController.generateAccessToken(user);
                    const refreshToken = UserController.generateRefreshToken(user);
                    refreshTokens.push(refreshToken);
                    // logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${req.body.phone} is login successfully`, 'login_success.log');
                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        sameSite: 'strict',
                    });
                    const { pin, ...others } = user._doc;
                    return res.status(200).json({
                        message: "Login Successfully",
                        data: { ...others },
                        token: accessToken,
                        status: true
                    });
                }
            }
            else {
                return res.status(200).json({
                    message: "Please enter your phone number and pin code. Do not leave any fields blank !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOtp: async (req, res, next) => {
        try {
            const OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            const PHONE = req.body.phone;
            if (PHONE !== null && PHONE !== '') {
                const dataTemp = new Otp({ phone: PHONE, otp: OTP });
                const result = await dataTemp.save((err) => {
                    if (!err) {
                        return res.status(200).json({
                            message: "Send OTP Successfully",
                            otp: OTP,
                            status: true
                        });
                    }
                    else {
                        return res.status(200).json({
                            message: "Send OTP Failure",
                            status: false
                        });
                    }
                });
            }
            else {
                return res.status(200).json({
                    message: "Please enter the phone number !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtp: async (req, res, next) => {
        try {
            const PHONE = req.body.phone;
            const OTP = req.body.otp;
            if (PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                const otpUser = await Otp.find({ phone: PHONE });
                if (otpUser.length === 0) {
                    return res.status(401).json({
                        message: "Expired OTP. Please Resend OTP !",
                        status: false
                    });
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.phone === PHONE && lastOtp.otp === OTP) {
                        await Otp.deleteMany({ phone: lastOtp.phone });
                        return res.status(200).json({
                            message: "Successfully. OTP VALID",
                            status: true,
                        })
                    }
                    else {
                        return res.status(401).json({
                            message: "Failure. OTP INVALID",
                            status: false,
                        })
                    }
                }
            }
            else {
                return res.status(200).json({
                    message: "Please enter your phone number and otp code. Do not leave any fields blank !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOtpPin: async (req, res, next) => {
        try {
            const validPhone = await Customer.findOne({ phone: req.body.phone });
            if (validPhone) {
                const validNid = await Personal.findOne({ citizenId: req.body.nid });
                if (validNid && validPhone.phone === validNid.phone) {
                    const OTP = otpGenerator.generate(6, {
                        digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
                    });
                    const PHONE = req.body.phone;
                    const NID = req.body.nid;
                    if (OTP !== null && PHONE !== null && NID !== null) {
                        const dataTemp = new Otp({ phone: PHONE, otp: OTP, nid: NID });
                        const result = await dataTemp.save();
                        return res.status(200).json({
                            message: "Send OTP Successfully",
                            otp: OTP,
                            status: true
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Wrong Nid ! Please Try Again",
                        status: false
                    });
                }
            }
            else {
                return res.status(200).json({
                    message: "Wrong phone ! Please Try Again",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtpPin: async (req, res, next) => {
        try {
            const validUser = await Otp.find({ phone: req.body.phone, nid: req.body.nid });
            if (validUser.length === 0) {
                return res.status(401).json({
                    message: "Expired OTP ! Please Resend OTP",
                    status: false
                });
            }
            const lastOtp = validUser[validUser.length - 1];
            if (lastOtp.phone === req.body.phone && lastOtp.nid === req.body.nid && lastOtp.otp === req.body.otp) {
                const accessToken = UserController.generateAccessToken(lastOtp);
                await Otp.deleteMany({ phone: lastOtp.phone, nid: req.body.nid });
                return res.status(200).json({
                    message: "OTP VALID",
                    token: accessToken,
                    status: true,
                })
            }
            else {
                return res.status(401).json({
                    message: "OTP INVALID",
                    status: false,
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    updatePin: async (req, res, next) => {
        try {
            const user = await Customer.findOne({ phone: req.body.phone });
            if (user) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.new_pin, salt);
                await user.updateOne({ $set: { pin: hashed } });
                // logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${req.body.phone} is updated successfully`, 'update_pin_success.log');
                return res.status(201).json({
                    message: "Update Password Successfully",
                    status: true
                });
            }
            else {
                return res.status(400).json({
                    message: "This account is not exists !"
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    updatePassword: async (req, res, next) => {
        try {
            const user = await Customer.findOne({ phone: req.body.phone });
            if (user) {
                const validPin = await bcrypt.compare(req.body.pin, user.pin);
                // logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${req.body.phone} is updated pin failure`, 'update_password_fail.log');
                if (validPin) {
                    if (req.body.new_pin) {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(req.body.new_pin, salt);
                        await user.updateOne({ $set: { pin: hashed } });
                        // logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${req.body.phone} is updated pin successfully`, 'update_password_success.log');
                        return res.status(201).json({
                            message: "Update Pin Successfully",
                            status: true
                        });
                    }
                    else {
                        return res.status(400).json({
                            message: "Please Enter Your New Pin"
                        })
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Your old pin is not correct !"
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: "This account is not exists !"
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllUser: async (req, res, next) => {
        try {
            const users = await Customer.find().select(_id, phone);
            if (users.length > 0) {
                return res.status(200).json({
                    data: users,
                    message: "Get List User Success",
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "List User Is Empty",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    }

};

module.exports = UserController;