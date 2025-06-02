const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/client.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de clientes
router.get('/', ClientController.getClients);
router.post('/', upload.single('transition_image'), ClientController.createClient);
router.put('/:id', upload.single('transition_image'), ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);

module.exports = router; 