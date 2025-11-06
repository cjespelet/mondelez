const pool = require('../config/database');

class ClientReportModel {
  static async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_reports (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_client_reports_client_id ON client_reports(client_id);
      CREATE INDEX IF NOT EXISTS idx_client_reports_created_at ON client_reports(created_at DESC);
    `);
  }

  static async listByClient({ clientId, page = 1, limit = 10 }) {
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit)));
    const safePage = Math.max(1, parseInt(page));
    const offset = (safePage - 1) * safeLimit;

    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS count FROM client_reports WHERE client_id = $1',
      [clientId]
    );
    const total = countRes.rows[0].count;

    const res = await pool.query(
      `SELECT id, client_id, url, created_at
       FROM client_reports
       WHERE client_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [clientId, safeLimit, offset]
    );

    return { data: res.rows, total, page: safePage, limit: safeLimit };
  }

  static async create({ clientId, url }) {
    const res = await pool.query(
      `INSERT INTO client_reports (client_id, url)
       VALUES ($1, $2)
       RETURNING id, client_id, url, created_at`,
      [clientId, url]
    );
    return res.rows[0];
  }

  static async delete({ reportId }) {
    await pool.query('DELETE FROM client_reports WHERE id = $1', [reportId]);
    return { success: true };
  }
}

module.exports = ClientReportModel;


