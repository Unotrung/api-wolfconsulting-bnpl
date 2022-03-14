const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const otpGenerator = require('otp-generator');

let refreshTokens = [];

const UserController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            // Add a secret key to make it more secure
            process.env.JWT_ACCESS_KEY,
            // After 2 hours this accessoken will disappear and the user has to login again
            { expiresIn: "1h" }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                phone: user.phone
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "1h" }
        );
    },

    checkPhoneExists: async (req, res) => {
        try {
            const user = await User.findOne({ phone: req.body.phone });
            if (user) {
                return res.status(200).json({
                    data: {
                        _id: user.id,
                        phone: user.phone
                    },
                    message: "This phone number already exists !",
                    isExists: true
                });
            }
            else {
                return res.status(401).json({
                    message: "This phone number does not exist yet !",
                    isExists: false
                });
            }
        }
        catch (err) {
            return res.status(500).json({ err: err });
        }
    },

    register: async (req, res) => {
        try {
            const auth = await User.findOne({ phone: req.body.phone });
            if (auth) {
                return res.status(401).json({
                    message: "This account already exists ! Please Login",
                    isExist: true
                });
            }
            // Get data from User
            let PHONE = req.body.phone;
            let PIN = req.body.pin;
            // Encryption pin with bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(PIN, salt);
            // Create New User 
            const user = await new User({ phone: PHONE, pin: hashed })
            const result = await user.save();
            const { pin, ...others } = result._doc;
            return res.status(200).json({
                message: "Register Successfully",
                data: { ...others },
                status: true
            });
        }
        catch (err) {
            return res.status(500).json({
                message: "Register Failure",
                err: err,
                status: false
            });
        }
    },

    login: async (req, res) => {
        try {
            const user = await User.findOne({ phone: req.body.phone });
            if (!user) {
                return res.status(401).json({ message: "Wrong phone !" });
            }
            // Compare user pin and db pin (compare 2 encrypted pin)
            const valiPin = await bcrypt.compare(req.body.pin, user.pin);
            if (!valiPin) {
                return res.status(401).json({ message: "Wrong pin!" });
            }
            if (user && valiPin) {
                // If auth and validPassword are valid, attach the accessToken
                const accessToken = UserController.generateAccessToken(user);
                // When the user's accessToken expires, it will automatically Refresh
                const refreshToken = UserController.generateRefreshToken(user);
                // Store refreshToken
                refreshTokens.push(refreshToken);
                // Save refreshToken to cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false, // When deploying to the server, change it back to true
                    path: '/', // It's okay to have it or not
                    sameSite: 'strict', // Prevent the attack. Http Requests can only come from this site
                });
                const { pin, ...others } = user._doc;
                // Khi trả thông tin người dùng về thì ta không nên trả về password kèm theo chỉ cần trả về những thông tin khác ngoại trừ password
                // đồng thời gắn kèm theo accessToken và refreshToken
                // Bởi vì ta đã lưu cái refreshToken này trong cookie òi nên mình không cần trả về front end. Mặc định khi đăng nhập ta sẽ luôn có 1 cookie
                // chứa refreshToken
                // return res.status(200).json({ ...others, accessToken, refreshToken });
                return res.status(200).json({
                    message: "Login Successfully",
                    accessToken: accessToken,
                    data: { ...others },
                    status: true
                });
            }
        }
        catch (err) {
            return res.status(500).json({
                message: "Login Failure",
                err: err,
                status: false
            });
        }
    },

    sendOtp: async (req, res) => {
        try {
            const user = await User.findOne({ phone: req.body.phone });
            if (user) {
                const OTP = otpGenerator.generate(6, {
                    digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
                });
                const PHONE = req.body.phone;
                if (OTP !== null && PHONE != null) {
                    const dataTemp = new Otp({ phone: PHONE, otp: OTP });
                    const result = await dataTemp.save();
                    return res.status(200).json({
                        message: "Send OTP Successfully",
                        otp: OTP,
                        status: true
                    });
                }
            }
            else {
                return res.status(401).json({
                    message: "This Phone Is Invalid !",
                });
            }
        }
        catch (err) {
            return res.status(500).json({
                message: "Send OTP Failure",
                err: err,
                status: false
            });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const otpUser = await Otp.find({ phone: req.body.phone });
            if (otpUser.length === 0) {
                return res.status(401).json({ message: "Expired OTP ! Please Resend OTP" });
            }
            // Get last otp
            const lastOtp = otpUser[otpUser.length - 1];
            if (lastOtp.phone === req.body.phone && lastOtp.otp === req.body.otp) {
                await Otp.deleteMany({ phone: lastOtp.phone });
                return res.status(200).json({
                    status: true,
                    message: "OTP VALID",
                })
            }
            else {
                return res.status(401).json({
                    status: false,
                    message: "OTP INVALID",
                })
            }
        }
        catch (err) {
            return res.status(500).json({ err: err });
        }
    }

};

module.exports = UserController;