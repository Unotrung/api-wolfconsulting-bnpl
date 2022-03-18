const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/generateContract", CommonController.generateContract);
router.get("/generateProviders", CommonController.generateProviders);

module.exports = router;