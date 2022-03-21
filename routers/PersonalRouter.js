const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const router = require("express").Router();

router.post("/register", PersonalController.register);
router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);
router.get("/:id", MiddlewareController.VerifyTokenByMySelf, PersonalController.getInfomation);

module.exports = router;