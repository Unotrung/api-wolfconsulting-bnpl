const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.post("/generateContract", CommonController.generateContract);
router.get("/generateProviders", CommonController.generateProviders);

module.exports = router;