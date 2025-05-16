const express = require('express');
const router = express.Router();
const PhoneController = require('../controllers/phone.controller');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

router.post('/', PhoneController.savePhoneNumber);

module.exports = router; 