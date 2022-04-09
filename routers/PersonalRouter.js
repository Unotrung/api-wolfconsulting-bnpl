const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const router = require("express").Router();

router.post("/addInfoPersonal",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),

        check('citizenId').matches(/^\d{12}$|^\d{9}$/).withMessage('Nid only accept numbers. Length of nid is 9 or 12'),

        check('name')
            .isLength({ min: 1 }).withMessage('Minimum length of name is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of name is 255'),

        check('city')
            .isLength({ min: 1 }).withMessage('Minimum length of city is 1')
            .isLength({ max: 64 }).withMessage('Maximum length of city is 64'),

        check('district')
            .isLength({ min: 1 }).withMessage('Minimum length of district is 1')
            .isLength({ max: 64 }).withMessage('Maximum length of district is 64'),

        check('ward')
            .isLength({ min: 1 }).withMessage('Minimum length of ward is 1')
            .isLength({ max: 64 }).withMessage('Maximum length of ward is 64'),

        // FIXME: thôn/xóm không có tên đường
        /*check('street')
            .isLength({ min: 1 }).withMessage('Minimum length of street is 1')
            .isLength({ max: 64 }).withMessage('Maximum length of street is 64'),
            */

        check('name_ref')
            .isLength({ min: 1 }).withMessage('Minimum length of name ref is 1')
            .isLength({ max: 255 }).withMessage('Maximum length of name ref is 255'),

        check('phone_ref').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone ref number format'),

        check('pin').matches(/^\d{4}$/).withMessage('Pin codes only accept numbers. Minimum and maximum length of pin is 4'),
    ],
    PersonalController.addInfoPersonal);

router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);

router.put("/registerProvider",
    [check('nid').matches(/^\d{12}$/).withMessage('Nid only accept numbers. Minimum and maximum length of nid is 12')],
    PersonalController.registerProvider);

router.put("/updateTenor",
    [check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),],
    MiddlewareController.VerifyTokenByMySelf, PersonalController.updateTenor);

router.get("/:phone", MiddlewareController.VerifyTokenByMySelf, PersonalController.getInfomation);

module.exports = router;