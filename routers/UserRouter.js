const UserController = require('../controllers/UserController');

const router = require("express").Router();

router.post("/checkPhoneExists", UserController.checkPhoneExists);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/sendOtp", UserController.sendOtp);
router.post("/verifyOtp", UserController.verifyOtp);

module.exports = router;