const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Rutas públicas
router.post('/login', AuthController.login);
router.get('/client-config', AuthController.getClientConfig);

// Rutas protegidas
router.get('/video-url', auth, AuthController.getVideoUrl);

module.exports = router; 