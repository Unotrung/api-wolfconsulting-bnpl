const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { check } = require('express-validator');
const router = require("express").Router();

router.get("/getAllTenor", CommonController.getAllTenor);
router.put("/updateStep",
    [
        check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
    ],
    MiddlewareController.validateRequestSchema, CommonController.updateStep);
router.get("/getAllCity", CommonController.getAllCity);
router.get("/getAllDistrict", CommonController.getAllDistrict);
router.get("/getAllWard", CommonController.getAllWard);
router.get("/getAllReferenceRelation", CommonController.getAllReferenceRelation);

module.exports = router;