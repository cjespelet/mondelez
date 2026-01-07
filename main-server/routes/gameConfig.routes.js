const express = require('express');
const router = express.Router();
const GameConfigController = require('../controllers/gameConfig.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/games', GameConfigController.getAllGames);
router.get('/clients/:clientId/games', GameConfigController.getClientGames);
router.post('/clients/:clientId/games', GameConfigController.assignGames);
router.get('/clients/:clientId/prizes', GameConfigController.getClientPrizes);
router.post('/clients/:clientId/prizes', GameConfigController.saveClientPrizes);

module.exports = router;


