const UserController = require('../controllers/UserController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const router = require("express").Router();
const { VALIDATE_PHONE, VALIDATE_NID, VALIDATE_PIN } = require('../config/validate_data/validate_data');
const { ERR_MESSAGE_PHONE, ERR_MESSAGE_PHONE_REF, ERR_MESSAGE_PIN, ERR_MESSAGE_NID, ERR_MESSAGE_NEW_PIN } = require('../config/message/message');

const formatPhone = VALIDATE_PHONE;
const formatNid = VALIDATE_NID;
const formatPin = VALIDATE_PIN;

const errMessagePhone = ERR_MESSAGE_PHONE;
const errMessageNid = ERR_MESSAGE_NID;
const errMessagePin = ERR_MESSAGE_PIN;
const errMessageNewPin = ERR_MESSAGE_NEW_PIN;

router.post("/checkPhoneExists",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone)
    ],
    MiddlewareController.validateRequestSchema, UserController.checkPhoneExists);

router.post("/checkNidExists",
    [
        check('nid').matches(formatNid).withMessage(errMessageNid)
    ],
    MiddlewareController.validateRequestSchema, UserController.checkNidExists);

router.post("/checkNidPhoneExists",
    [
        check('nid').matches(formatNid).withMessage(errMessageNid),
        check('phone').matches(formatPhone).withMessage(errMessagePhone)
    ],
    MiddlewareController.validateRequestSchema, UserController.checkNidPhoneExists);

router.post("/sendOtp",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone)
    ],
    MiddlewareController.validateRequestSchema, UserController.sendOtp);

router.post("/verifyOtp",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone)
    ],
    MiddlewareController.validateRequestSchema, UserController.verifyOtp);

router.post("/login",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('pin').matches(formatPin).withMessage(errMessagePin),
    ],
    MiddlewareController.validateRequestSchema, UserController.login);

router.post("/sendOtpPin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('nid').matches(formatNid).withMessage(errMessageNid),
    ],
    MiddlewareController.validateRequestSchema, UserController.sendOtpPin);

router.post("/verifyOtpPin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('nid').matches(formatNid).withMessage(errMessageNid),
    ],
    MiddlewareController.validateRequestSchema, UserController.verifyOtpPin);

router.put("/resetPin", MiddlewareController.verifyTokenByMySelf,
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('new_pin').matches(formatPin).withMessage(errMessageNewPin),
    ],
    MiddlewareController.validateRequestSchema, UserController.resetPin);

router.put("/updatePin",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('pin').matches(formatPin).withMessage(errMessagePin),
        check('new_pin').matches(formatPin).withMessage(errMessageNewPin),
    ],
    MiddlewareController.validateRequestSchema, UserController.updatePin);

router.get("/getAllUser", UserController.getAllUser);

router.put("/requestRefreshToken", UserController.requestRefreshToken);

module.exports = router;
