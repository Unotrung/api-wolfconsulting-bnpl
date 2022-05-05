const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const router = require("express").Router();

router.post("/addInfoPersonal", PersonalController.addInfoPersonal);
router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);
router.put("/registerProvider", PersonalController.registerProvider);
router.put("/updateTenor", MiddlewareController.VerifyTokenByMySelf, PersonalController.updateTenor);
router.get("/:phone", MiddlewareController.VerifyTokenByMySelf, PersonalController.getInfomation);
router.delete("/deletePersonalandAccount", PersonalController.deletePersonalandAccount);
router.delete("/deletePersonalandAccountPhu", PersonalController.deletePersonalandAccountPhu);

module.exports = router;