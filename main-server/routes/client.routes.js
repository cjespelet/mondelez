const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/client.controller');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de clientes
router.get('/', ClientController.getClients);
router.post('/', ClientController.createClient);
router.put('/:id', ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);

module.exports = router; 