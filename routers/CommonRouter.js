const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/getHVToken", CommonController.getHVToken);
router.get("/getAllTenor", CommonController.getAllTenor);
router.put("/updateStep", CommonController.updateStep);
// router.post("/checkStep", CommonController.checkStep);
// router.put("/eSignContract", CommonController.eSignContract);
// router.put("/completeSuccess", CommonController.completeSuccess);

module.exports = router;