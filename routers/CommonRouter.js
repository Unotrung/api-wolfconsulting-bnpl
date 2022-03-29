const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/getHVToken", CommonController.getHVToken);
router.get("/getAllTenor", CommonController.getAllTenor);

module.exports = router;