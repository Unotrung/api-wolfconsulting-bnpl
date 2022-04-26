const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const router = require("express").Router();

const formatPhone = /^(09|03|07|08|05)+([0-9]{8}$)/;
const formatNid = /^\d{12}$|^\d{9}$/;
const formatPin = /^\d{4}$/;
const errMessagePhone = 'Invalid phone number format';
const errMessageRefPhone = 'Invalid phone ref number format'
const errMessageNid = 'Nid only accepts numbers. Length of nid is 9 or 12';
const errMessagePin = 'Pin codes only accepts numbers. Length of pin is 4';

router.post("/addInfoPersonal",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),

        check('citizenId').matches(formatNid).withMessage(errMessageNid),

        check('name')
            .isLength({ min: 1 }).withMessage('Minimum length of name is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of name is 255'),

        check('city')
            .isLength({ min: 1 }).withMessage('Minimum length of city is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of city is 255'),

        check('district')
            .isLength({ min: 1 }).withMessage('Minimum length of district is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of district is 255'),

        check('ward')
            .isLength({ min: 1 }).withMessage('Minimum length of ward is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of ward is 255'),

        // FIXME: thôn/xóm không có tên đường
        /*check('street')
            .isLength({ min: 1 }).withMessage('Minimum length of street is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of street is 255'),
        */

        check('name_ref')
            .isLength({ min: 1 }).withMessage('Minimum length of name ref is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of name ref is 255'),

        check('phone_ref').matches(formatPhone).withMessage(errMessageRefPhone),

        check('pin').matches(formatPin).withMessage(errMessagePin),
    ],
    MiddlewareController.validateRequestSchema, PersonalController.addInfoPersonal);

router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);

router.put("/registerProvider",
    [
        check('nid').matches(formatNid).withMessage(errMessageNid)
    ],
    MiddlewareController.validateRequestSchema, PersonalController.registerProvider);

router.put("/updateTenor",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.validateRequestSchema, PersonalController.updateTenor);

router.get("/:phone", MiddlewareController.verifyTokenByMySelf, PersonalController.getInfomation);

router.post("/getDataFromVoolo",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, PersonalController.getDataFromVoolo);

router.put("/signContract",
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, PersonalController.signContract);

module.exports = router;