const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class ClientController {
  static async getClients(req, res) {
    try {
      const { page = 1, limit = 10, search = '', distributor = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.id, c.name, c.video_url, c.created_at, d.name as distributor_name
        FROM clients c
        LEFT JOIN distributors d ON c.distributor_id = d.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND c.name ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (distributor) {
        query += ` AND c.distributor_id = $${paramIndex}`;
        params.push(distributor);
        paramIndex++;
      }

      // Obtener total de registros
      const countQuery = query.replace('SELECT c.id, c.name, c.video_url, c.created_at, d.name as distributor_name', 'SELECT COUNT(*)');
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Agregar paginación
      query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        clients: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los clientes'
      });
    }
  }

  static async createClient(req, res) {
    try {
      const { name, video_url, distributor_id } = req.body;

      if (!name || !video_url) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y video_url son requeridos'
        });
      }

      // Verificar si ya existe un cliente con el mismo nombre
      const existingClient = await pool.query(
        'SELECT id FROM clients WHERE name = $1',
        [name]
      );

      if (existingClient.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese nombre'
        });
      }

      // Crear cliente
      const result = await pool.query(
        `INSERT INTO clients (name, video_url, distributor_id) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, video_url, distributor_id, created_at`,
        [name, video_url, distributor_id || null]
      );

      res.status(201).json({
        success: true,
        client: result.rows[0]
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el cliente'
      });
    }
  }

  static async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { name, video_url, distributor_id } = req.body;

      if (!name || !video_url) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y video_url son requeridos'
        });
      }

      // Verificar si el cliente existe
      const existingClient = await pool.query(
        'SELECT id FROM clients WHERE id = $1',
        [id]
      );

      if (existingClient.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const updateQuery = `
        UPDATE clients 
        SET name = $1, video_url = $2, distributor_id = $3
        WHERE id = $4 
        RETURNING id, name, video_url, distributor_id, created_at
      `;
      const params = [name, video_url, distributor_id || null, id];

      const result = await pool.query(updateQuery, params);

      res.json({
        success: true,
        client: result.rows[0]
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el cliente'
      });
    }
  }

  static async deleteClient(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el cliente existe
      const existingClient = await pool.query(
        'SELECT id FROM clients WHERE id = $1',
        [id]
      );

      if (existingClient.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Eliminar cliente
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el cliente'
      });
    }
  }
}

module.exports = ClientController; 