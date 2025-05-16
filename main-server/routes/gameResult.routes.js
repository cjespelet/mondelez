const express = require('express');
const router = express.Router();
const GameResultController = require('../controllers/gameResult.controller');
const auth = require('../middleware/auth');

// Rutas protegidas
router.post('/', GameResultController.saveResult);
router.get('/:clientId', auth, GameResultController.getResultsByClient);
router.get('/', auth, GameResultController.getResultsWithFilters);

module.exports = router; 