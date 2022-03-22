const UserController = require('../controllers/UserController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require("express").Router();

router.post("/checkPhoneExists", UserController.checkPhoneExists);
router.post("/sendOtp", UserController.sendOtp);
router.post("/verifyOtp", UserController.verifyOtp);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/sendOtpPin", UserController.sendOtpPin);
router.post("/verifyOtpPin", UserController.verifyOtpPin);
router.put("/updatepin", MiddlewareController.VerifyTokenByMySelf, UserController.updatePin);
router.put("/updatepassword", MiddlewareController.VerifyTokenByMySelf, UserController.updatePassword);
router.get("/getAllUser", UserController.getAllUser);

module.exports = router;