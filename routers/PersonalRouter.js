const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const router = require("express").Router();

router.post("/register", MiddlewareController.verifyToken, PersonalController.register);

module.exports = router;