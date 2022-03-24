const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/getHVToken", CommonController.getHVToken);

module.exports = router;