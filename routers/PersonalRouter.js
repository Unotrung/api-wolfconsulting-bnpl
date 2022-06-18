const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const { upload } = require('../multer/index');
const router = require('express').Router();
const { VALIDATE_PHONE, VALIDATE_PHONE_REF, VALIDATE_NID, VALIDATE_PIN } = require('../config/validate_data/validate_data');
const { ERR_MESSAGE_PHONE, ERR_MESSAGE_PHONE_REF, ERR_MESSAGE_PIN, ERR_MESSAGE_NID, ERR_MESSAGE_NEW_PIN,
    ERR_MESSAGE_MIN_NAME, ERR_MESSAGE_MAX_NAME, ERR_MESSAGE_MIN_CITY, ERR_MESSAGE_MAX_CITY, ERR_MESSAGE_MIN_DISTRICT, ERR_MESSAGE_MAX_DISTRICT,
    ERR_MESSAGE_MIN_WARD, ERR_MESSAGE_MAX_WARD, ERR_MESSAGE_MIN_NAME_REF, ERR_MESSAGE_MAX_NAME_REF
} = require('../config/message/message');

const formatPhone = VALIDATE_PHONE;
const formatPhoneRef = VALIDATE_PHONE_REF;
const formatNid = VALIDATE_NID;
const formatPin = VALIDATE_PIN;

const errMessagePhone = ERR_MESSAGE_PHONE;
const errMessageRefPhone = ERR_MESSAGE_PHONE_REF;
const errMessageNid = ERR_MESSAGE_NID;
const errMessagePin = ERR_MESSAGE_PIN;

router.post("/addInfoPersonal", MiddlewareController.verifySecurity,
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
        check('citizenId').matches(formatNid).withMessage(errMessageNid),
        check('name')
            .isLength({ min: 1 }).withMessage(ERR_MESSAGE_MIN_NAME)
            .isLength({ max: 255 }).withMessage(ERR_MESSAGE_MAX_NAME),
        check('city')
            .isLength({ min: 1 }).withMessage(ERR_MESSAGE_MIN_CITY)
            .isLength({ max: 255 }).withMessage(ERR_MESSAGE_MAX_CITY),
        check('district')
            .isLength({ min: 1 }).withMessage(ERR_MESSAGE_MIN_DISTRICT)
            .isLength({ max: 255 }).withMessage(ERR_MESSAGE_MAX_DISTRICT),
        check('ward')
            .isLength({ min: 1 }).withMessage(ERR_MESSAGE_MIN_WARD)
            .isLength({ max: 255 }).withMessage(ERR_MESSAGE_MAX_WARD),
        // FIXME: thôn/xóm không có tên đường
        /*check('street')
            .isLength({ min: 1 }).withMessage('Minimum length of street is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of street is 255'),
        */
        check('name_ref')
            .isLength({ min: 1 }).withMessage(ERR_MESSAGE_MIN_NAME_REF)
            .isLength({ max: 255 }).withMessage(ERR_MESSAGE_MAX_NAME_REF),
        check('phone_ref').matches(formatPhoneRef).withMessage(errMessageRefPhone),
        check('pin').matches(formatPin).withMessage(errMessagePin),
    ],
    PersonalController.addInfoPersonal);

router.get("/getAllBNPLInformation", MiddlewareController.verifySecurity, PersonalController.getAllBNPLInformation);

router.put("/registerProvider", MiddlewareController.verifySecurity,
    [
        check('nid').matches(formatNid).withMessage(errMessageNid)
    ],
    MiddlewareController.validateRequestSchema, PersonalController.registerProvider);

router.put("/updateTenor", MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        check('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, PersonalController.updateTenor);

router.get("/:phone", MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, PersonalController.getInfomation);

// router.post("/getDataFromVoolo",
//     [
//         check('phone').matches(formatPhone).withMessage(errMessagePhone),
//     ],
//     MiddlewareController.validateRequestSchema, PersonalController.getDataFromVoolo);

// router.put("/signContract",
//     [
//         check('phone').matches(formatPhone).withMessage(errMessagePhone),
//     ],
//     MiddlewareController.validateRequestSchema, PersonalController.signContract);

module.exports = router;