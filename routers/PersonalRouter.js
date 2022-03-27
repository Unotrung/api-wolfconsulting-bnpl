const PersonalController = require('../controllers/PersonalController');
const MiddlewareController = require('../controllers/MiddlewareController');
const router = require("express").Router();

router.post("/addInfoPersonal", PersonalController.addInfoPersonal);
router.get("/getAllBNPLInformation", PersonalController.getAllBNPLInformation);
router.get("/:id", PersonalController.getInfomation);
router.post("/addProvider", PersonalController.addProvider);

module.exports = router;