const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require("express").Router();

router.get("/generateContract", MiddlewareController.verifyToken, CommonController.generateContract);
router.get("/generateProviders", MiddlewareController.verifyToken, CommonController.generateProviders);
router.get("/getHVToken", MiddlewareController.verifyToken, CommonController.getHVToken);

module.exports = router;