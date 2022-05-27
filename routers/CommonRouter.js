const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const router = require('express').Router();
const { VALIDATE_PHONE } = require('../config/validate_data/validate_data');
const { ERR_MESSAGE_PHONE } = require('../config/message/message');

router.get('/getAllTenor', CommonController.getAllTenor);
router.put('/updateStep',
    [
        check('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, CommonController.updateStep);
router.get('/getAllCity', CommonController.getAllCity);
router.get('/getAllDistrict', CommonController.getAllDistrict);
router.get('/getAllWard', CommonController.getAllWard);
router.get('/getAllReferenceRelation', CommonController.getAllReferenceRelation);

module.exports = router;