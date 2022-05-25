const FecController = require('../controllers/FecController');
const router = require('express').Router();

router.get('/getHVToken', FecController.getHVToken);
router.get('/checkEMIInfo', FecController.checkEMIInfo);
router.post('/registration', FecController.registration);
router.post('/checkBNPLInfo', FecController.checkBNPLInfo);
router.post('/checkAccountInfo', FecController.checkAccountInfo);
router.post('/checkoutTransaction', FecController.checkoutTransaction);

module.exports = router;