const UserController = require('../controllers/UserController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require("express").Router();

router.post("/checkPhoneExists", UserController.checkPhoneExists);
router.post("/sendOtp", UserController.sendOtp);
router.post("/verifyOtp", UserController.verifyOtp);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/sendOtpPin", MiddlewareController.VerifyTokenByMySelf, UserController.sendOtp);
router.post("/verifyOtpPin", MiddlewareController.VerifyTokenByMySelf, UserController.verifyOtp);
router.put("/updatepin", MiddlewareController.VerifyTokenByMySelf, UserController.updatePin);

module.exports = router;