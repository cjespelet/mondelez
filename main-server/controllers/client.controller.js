const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class ClientController {
  static async getClients(req, res) {
    try {
      const { page = 1, limit = 10, search = '', distributor = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.id, c.name, c.video_url, c.created_at, d.name as distributor_name, u.username
        FROM clients c
        LEFT JOIN distributors d ON c.distributor_id = d.id
        LEFT JOIN users u ON c.id = u.client_id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (c.name ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (distributor) {
        query += ` AND c.distributor_id = $${paramIndex}`;
        params.push(distributor);
        paramIndex++;
      }

      // Obtener total de registros
      const countQuery = query.replace('SELECT c.id, c.name, c.video_url, c.created_at, d.name as distributor_name, u.username', 'SELECT COUNT(*)');
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
    const client = await pool.connect();
    try {
      const { name, username, password, video_url, distributor_id } = req.body;

      if (!name || !username || !password || !video_url) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      await client.query('BEGIN');

      // Verificar si ya existe un cliente con el mismo nombre
      const existingClient = await client.query(
        'SELECT id FROM clients WHERE name = $1',
        [name]
      );

      if (existingClient.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese nombre'
        });
      }

      // Verificar si ya existe un usuario con el mismo username
      const existingUser = await client.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con ese nombre de usuario'
        });
      }

      // Crear cliente
      const clientResult = await client.query(
        `INSERT INTO clients (name, video_url, distributor_id) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, video_url, distributor_id, created_at`,
        [name, video_url, distributor_id || null]
      );

      const clientId = clientResult.rows[0].id;

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario asociado al cliente
      await client.query(
        `INSERT INTO users (username, password, role, client_id) 
         VALUES ($1, $2, $3, $4)`,
        [username, hashedPassword, 'client', clientId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        client: {
          ...clientResult.rows[0],
          username
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el cliente'
      });
    } finally {
      client.release();
    }
  }

  static async updateClient(req, res) {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { name, video_url, distributor_id, password } = req.body;

      if (!name || !video_url) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y video_url son requeridos'
        });
      }

      await client.query('BEGIN');

      // Verificar si el cliente existe
      const existingClient = await client.query(
        'SELECT id FROM clients WHERE id = $1',
        [id]
      );

      if (existingClient.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Actualizar cliente
      const updateQuery = `
        UPDATE clients 
        SET name = $1, video_url = $2, distributor_id = $3
        WHERE id = $4 
        RETURNING id, name, video_url, distributor_id, created_at
      `;
      const params = [name, video_url, distributor_id || null, id];

      const result = await client.query(updateQuery, params);

      // Si se proporcionó una nueva contraseña, actualizarla
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await client.query(
          'UPDATE users SET password = $1 WHERE client_id = $2',
          [hashedPassword, id]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        client: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el cliente'
      });
    } finally {
      client.release();
    }
  }

  static async deleteClient(req, res) {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      // Verificar si el cliente existe
      const existingClient = await client.query(
        'SELECT id FROM clients WHERE id = $1',
        [id]
      );

      if (existingClient.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Eliminar usuario asociado
      await client.query('DELETE FROM users WHERE client_id = $1', [id]);

      // Eliminar cliente
      await client.query('DELETE FROM clients WHERE id = $1', [id]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el cliente'
      });
    } finally {
      client.release();
    }
  }
}

module.exports = ClientController; 