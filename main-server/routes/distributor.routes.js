const express = require('express');
const router = express.Router();
const DistributorController = require('../controllers/distributors.controller');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de clientes
router.get('/', DistributorController.getDistributors);
router.post('/', DistributorController.createDistributor);
router.put('/:id', DistributorController.updateDistributor);
router.delete('/:id', DistributorController.deleteDistributor);

module.exports = router; 