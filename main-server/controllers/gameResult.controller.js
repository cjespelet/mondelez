const pool = require('../config/database');
const GameResult = require('../models/gameResult.model');

class GameResultController {
  static async saveResult(req, res) {
    try {
      const { clientId, result, date, phoneNumber, gameType = 'tapadita' } = req.body;
      
      // Validar los datos recibidos
      if (!clientId || !result || !date) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }

      if (!['Ganado', 'Perdido'].includes(result)) {
        return res.status(400).json({ error: 'Resultado inválido' });
      }

      const allowedGames = ['tapadita', 'ruleta'];
      const normalizedGameType = allowedGames.includes(String(gameType)) ? String(gameType) : 'tapadita';

      const savedResult = await GameResult.saveResult(clientId, result, date, phoneNumber, normalizedGameType);
      res.status(201).json({
        message: 'Resultado guardado exitosamente',
        id: savedResult.id
      });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getResultsByClient(req, res) {
    try {
      const { clientId } = req.params;
      const results = await GameResult.getResultsByClient(clientId);
      res.json(results);
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getResultsWithFilters(req, res) {
    try {
      const { page = 1, limit = 10, client, date, distributor, gameType } = req.query;
      console.log('Query params:', { page, limit, client, date, distributor });
      const offset = (page - 1) * limit;

      let query = `
        SELECT gr.*, c.name as client_name, d.name as distributor_name
        FROM game_results gr
        JOIN clients c ON gr.client_id::integer = c.id
        LEFT JOIN distributors d ON c.distributor_id = d.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (client) {
        query += ` AND gr.client_id::integer = $${paramIndex}::integer`;
        params.push(client);
        paramIndex++;
      }

      if (date) {
        query += ` AND DATE(gr.date) = $${paramIndex}`;
        params.push(date);
        paramIndex++;
      }

      if (distributor) {
        query += ` AND c.distributor_id::integer = $${paramIndex}::integer`;
        params.push(distributor);
        paramIndex++;
      }

      if (gameType) {
        query += ` AND gr.game_type = $${paramIndex}`;
        params.push(gameType);
        paramIndex++;
      }

      // Obtener total de registros
      const countQuery = query.replace('SELECT gr.*, c.name as client_name, d.name as distributor_name', 'SELECT COUNT(*)');
      console.log('Count Query:', countQuery);
      console.log('Params:', params);
      
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Agregar paginación
      query += ` ORDER BY gr.date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      console.log('Final Query:', query);
      console.log('Final Params:', params);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        results: result.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los resultados'
      });
    }
  }
}

module.exports = GameResultController; 