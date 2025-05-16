const pool = require('../config/database');

class DistributorController {
  // Obtener todos los distribuidores con paginación y búsqueda
  static async getDistributors(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, name, city, created_at 
        FROM distributors 
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Obtener total de registros
      const countQuery = query.replace('SELECT id, name, city, created_at', 'SELECT COUNT(*)');
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Agregar paginación
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        distributors: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener distribuidores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los distribuidores'
      });
    }
  }

  // Crear un nuevo distribuidor
  static async createDistributor(req, res) {
    try {
      const { name, city } = req.body;

      // Validar campos requeridos
      if (!name || !city) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y la ciudad son campos requeridos'
        });
      }

      // Insertar nuevo distribuidor
      const result = await pool.query(
        `INSERT INTO distributors (name, city)
         VALUES ($1, $2)
         RETURNING id, name, city, created_at`,
        [name, city]
      );

      res.status(201).json({
        success: true,
        distributor: result.rows[0]
      });
    } catch (error) {
      console.error('Error al crear distribuidor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el distribuidor'
      });
    }
  }

  // Actualizar un distribuidor existente
  static async updateDistributor(req, res) {
    try {
      const { id } = req.params;
      const { name, city } = req.body;

      // Verificar si el distribuidor existe
      const distributorExists = await pool.query(
        'SELECT id FROM distributors WHERE id = $1',
        [id]
      );

      if (distributorExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Distribuidor no encontrado'
        });
      }

      // Validar que al menos un campo se proporcione para actualizar
      if (!name && !city) {
        return res.status(400).json({
          success: false,
          message: 'Se debe proporcionar al menos un campo para actualizar'
        });
      }

      // Construir la consulta de actualización
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      if (name) {
        updateFields.push(`name = $${paramIndex}`);
        params.push(name);
        paramIndex++;
      }
      if (city) {
        updateFields.push(`city = $${paramIndex}`);
        params.push(city);
        paramIndex++;
      }

      params.push(id);

      const result = await pool.query(
        `UPDATE distributors 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, city, created_at`,
        params
      );

      res.json({
        success: true,
        distributor: result.rows[0]
      });
    } catch (error) {
      console.error('Error al actualizar distribuidor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el distribuidor'
      });
    }
  }

  // Eliminar un distribuidor
  static async deleteDistributor(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el distribuidor existe
      const distributorExists = await pool.query(
        'SELECT id FROM distributors WHERE id = $1',
        [id]
      );

      if (distributorExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Distribuidor no encontrado'
        });
      }

      // Eliminar el distribuidor
      await pool.query('DELETE FROM distributors WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Distribuidor eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar distribuidor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el distribuidor'
      });
    }
  }
}

module.exports = DistributorController;
