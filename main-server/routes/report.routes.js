const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ReportController = require('../controllers/report.controller');

// secure all
router.use(auth);

// GET /api/clients/:id/reports
router.get('/clients/:id/reports', ReportController.list);

// POST /api/clients/:id/reports
router.post('/clients/:id/reports', ReportController.create);

// DELETE /api/reports/:reportId
router.delete('/reports/:reportId', ReportController.remove);

module.exports = router;


