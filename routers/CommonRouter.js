const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const router = require('express').Router();
const { VALIDATE_PHONE } = require('../config/validate_data/validate_data');
const { ERR_MESSAGE_PHONE } = require('../config/message/message');

router.get('/getAllTenor', MiddlewareController.verifySecurity, CommonController.getAllTenor);
router.put('/updateStep', MiddlewareController.verifySecurity,
    [
        check('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, CommonController.updateStep);
router.get('/getAllCity', MiddlewareController.verifySecurity, CommonController.getAllCity);
router.get('/getAllDistrict', MiddlewareController.verifySecurity, CommonController.getAllDistrict);
router.get('/getAllWard', MiddlewareController.verifySecurity, CommonController.getAllWard);
router.get('/getAllReferenceRelation', MiddlewareController.verifySecurity, CommonController.getAllReferenceRelation);
router.post('/getDistrict', MiddlewareController.verifySecurity, CommonController.getDistrict);
router.post('/getWard', MiddlewareController.verifySecurity, CommonController.getWard);

module.exports = router;