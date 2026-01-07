const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WheelController = require('../controllers/wheel.controller');

router.use(auth);

router.post('/spin', WheelController.spin);
router.post('/save-result', WheelController.saveResult);
router.patch('/update-phone/:resultId', WheelController.updatePhone);

module.exports = router;




