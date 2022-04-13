const CommonController = require('../controllers/CommonController');
const { check } = require('express-validator');
const router = require("express").Router();

router.get("/getHVToken", CommonController.getHVToken);
router.get("/getAllTenor", CommonController.getAllTenor);
router.put("/updateStep", [
    check('phone').matches(/^(09|03|07|08|05)+([0-9]{8}$)/).withMessage('Invalid phone number format'),
], CommonController.updateStep);
// router.post("/checkStep", CommonController.checkStep);
// router.put("/eSignContract", CommonController.eSignContract);
// router.put("/completeSuccess", CommonController.completeSuccess);

module.exports = router;