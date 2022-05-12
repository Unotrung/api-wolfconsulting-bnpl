const FecController = require('../controllers/FecController');
const router = require("express").Router();

router.get("/getHVToken", FecController.getHVToken);
router.post("/registration", FecController.registration);
router.post("/checkBNPLInfo", FecController.checkBNPLInfo);
router.post("/checkAccountInfo", FecController.checkAccountInfo);

module.exports = router;