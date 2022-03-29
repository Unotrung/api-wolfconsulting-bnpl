const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const router = require("express").Router();

router.get("/:phone", MiddlewareController.VerifyTokenByMySelf, PersonalController.getInfomation);
router.post("/addInfoPersonal", PersonalController.addInfoPersonal);
router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);
router.put("/registerProvider", PersonalController.registerProvider);
router.put("/updateTenor", PersonalController.updateTenor);
router.delete("/deletePersonalandAccount", PersonalController.deletePersonalandAccount);
router.delete("/deletePersonalandAccountPhu", PersonalController.deletePersonalandAccountPhu);

module.exports = router;