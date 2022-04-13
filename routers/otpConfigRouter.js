const otpConfigController = require('../controllers/OtpConfigController');
const router = require("express").Router();
const { master } = require('../helpers/auth');

router.get("", otpConfigController.getOtpConfig);
router.post("", master, otpConfigController.postOtpConfig);
router.put("", master, otpConfigController.putOtpConfig);

module.exports = router;
