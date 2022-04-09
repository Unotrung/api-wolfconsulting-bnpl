const UserController = require('../controllers/UserController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');

const router = require("express").Router();

router.post("/checkPhoneExists",
    [check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),],
    UserController.checkPhoneExists);

router.post("/checkNidExists",
    [check('nid').matches(/^\d{12}$|^\d{9}$/).withMessage('Nid only accept numbers. Length of nid is 9 or 12')],
    UserController.checkNidExists);

router.post("/sendOtp",
    [check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),],
    UserController.sendOtp);

router.post("/verifyOtp",
    [check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),],
    UserController.verifyOtp);

router.post("/register",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
        check('pin').matches(/^\d{4}$/).withMessage('Pin codes only accept numbers. Minimum and maximum length of pin is 4'),
    ],
    UserController.register);

router.post("/login",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
        check('pin').matches(/^\d{4}$/).withMessage('Pin codes only accept numbers. Minimum and maximum length of pin is 4'),
    ],
    UserController.login);

router.post("/sendOtpPin",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
        check('nid').matches(/^\d{12}$|^\d{9}$/).withMessage('Nid only accept numbers. Length of nid is 9 or 12'),
    ],
    UserController.sendOtpPin);

router.post("/verifyOtpPin",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
        check('nid').matches(/^\d{12}$|^\d{9}$/).withMessage('Nid only accept numbers. Length of nid is 9 or 12'),
    ],
    UserController.verifyOtpPin);

router.put("/resetPin",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
        check('new_pin').matches(/^\d{4}$/).withMessage('New pin codes only accept numbers. Minimum and maximum length of new pin is 4'),
    ],
    MiddlewareController.VerifyTokenByMySelf, UserController.resetPin);

router.put("/updatePin",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
        check('pin').matches(/^\d{4}$/).withMessage('Pin codes only accept numbers. Minimum and maximum length of pin is 4'),
        check('new_pin').matches(/^\d{4}$/).withMessage('New pin codes only accept numbers. Minimum and maximum length of new pin is 4'),
    ],
    UserController.updatePin);

router.get("/getAllUser", UserController.getAllUser);

module.exports = router;