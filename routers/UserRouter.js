const UserController = require('../controllers/UserController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const { master } = require('../helpers/auth')

const router = require("express").Router();

const formatPhone = /^(09|03|07|08|05)+([0-9]{8}$)/;
const formatNid = /^\d{12}$|^\d{9}$/;
const formatPin = /^\d{4}$/;
const errMessagePhone = 'Invalid phone number format';
const errMessageNid = 'Nid only accepts numbers. Length of nid is 9 or 12';
const errMessagePin = 'Pin codes only accepts numbers. Length of pin is 4';
const errMessageNewPin = 'New pin codes only accepts numbers. Length of of new pin is 4';

router.post("/checkPhoneExists",
    [check('phone').matches(formatPhone).withMessage(errMessagePhone)],
    UserController.checkPhoneExists);

router.post("/checkNidExists",
    [check('nid').matches(formatNid).withMessage(errMessageNid)],
    UserController.checkNidExists);

router.post("/checkNidPhoneExists",
    [
        check('nid').matches(formatNid).withMessage(errMessageNid),
        check('phone').matches(formatPhone).withMessage(errMessagePhone)
    ],
    UserController.checkNidPhoneExists);

router.post("/sendOtp",
    [check('phone').matches(formatPhone).withMessage(errMessagePhone)],
    UserController.sendOtp);

router.post("/verifyOtp",
    [check('phone').matches(formatPhone).withMessage(errMessagePhone)],
    UserController.verifyOtp);

// router.post("/register",
//     [
//         check('phone').matches(formatPhone).withMessage(errMessagePhone),
//         check('pin').matches(formatPin).withMessage(errMessagePin),
//     ],
//     UserController.register);

router.post("/login",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('pin').matches(formatPin).withMessage(errMessagePin),
    ],
    UserController.login);

router.post("/sendOtpPin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('nid').matches(formatNid).withMessage(errMessageNid),
    ],
    UserController.sendOtpPin);

router.post("/verifyOtpPin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('nid').matches(formatNid).withMessage(errMessageNid),
    ],
    UserController.verifyOtpPin);

router.put("/resetPin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('new_pin').matches(formatPin).withMessage(errMessageNewPin),
    ],
    MiddlewareController.verifyTokenByMySelf, UserController.resetPin);

router.put("/updatePin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('pin').matches(formatPin).withMessage(errMessagePin),
        check('new_pin').matches(formatPin).withMessage(errMessageNewPin),
    ],
    UserController.updatePin);

router.get("/getAllUser", UserController.getAllUser);

router.post("/eSignUser", master, UserController.updateESignUser)

module.exports = router;
