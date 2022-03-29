const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const router = require("express").Router();

router.get("/:phone", MiddlewareController.VerifyTokenByMySelf, PersonalController.getInfomation);
router.post("/addInfoPersonal", PersonalController.addInfoPersonal);
router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);
router.post("/registerProvider", PersonalController.registerProvider);
router.delete("/deletePersonalandAccount", PersonalController.deletePersonalandAccount);

module.exports = router;