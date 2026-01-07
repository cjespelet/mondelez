const ClientReportModel = require('../models/clientReport.model');

class ReportController {
  static async ensureTable() {
    try {
      await ClientReportModel.createTable();
    } catch (e) {
      console.error('Failed to ensure client_reports table:', e);
    }
  }

  static async list(req, res) {
    try {
      const clientId = parseInt(req.params.id);
      const { page = 1, limit = 10 } = req.query;
      if (Number.isNaN(clientId)) return res.status(400).json({ success: false, message: 'clientId inválido' });
      const result = await ClientReportModel.listByClient({ clientId, page, limit });
      return res.json({ success: true, data: result.data, total: result.total, page: result.page, limit: result.limit });
    } catch (error) {
      console.error('Error list reports:', error);
      return res.status(500).json({ success: false, message: 'Error al listar reportes' });
    }
  }

  static async create(req, res) {
    try {
      const clientId = parseInt(req.params.id);
      const { url } = req.body || {};
      if (Number.isNaN(clientId)) return res.status(400).json({ success: false, message: 'clientId inválido' });
      if (!url || typeof url !== 'string') return res.status(400).json({ success: false, message: 'URL requerida' });
      const report = await ClientReportModel.create({ clientId, url: url.trim() });
      return res.status(201).json({ success: true, report });
    } catch (error) {
      console.error('Error create report:', error);
      return res.status(500).json({ success: false, message: 'Error al crear reporte' });
    }
  }

  static async remove(req, res) {
    try {
      const reportId = parseInt(req.params.reportId);
      if (Number.isNaN(reportId)) return res.status(400).json({ success: false, message: 'reportId inválido' });
      await ClientReportModel.delete({ reportId });
      return res.json({ success: true });
    } catch (error) {
      console.error('Error delete report:', error);
      return res.status(500).json({ success: false, message: 'Error al eliminar reporte' });
    }
  }
}

module.exports = ReportController;





