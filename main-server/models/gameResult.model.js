const pool = require('../config/database');

class GameResult {
  static async createTable() {
    try {
      // Crear la tabla de resultados del juego
      await pool.query(`
        CREATE TABLE IF NOT EXISTS game_results (
          id SERIAL PRIMARY KEY,
          client_id VARCHAR(255) NOT NULL,
          result VARCHAR(10) NOT NULL CHECK (result IN ('Ganado', 'Perdido')),
          date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          phone_number VARCHAR(20)
        );

        CREATE INDEX IF NOT EXISTS idx_game_results_client_id ON game_results(client_id);
        CREATE INDEX IF NOT EXISTS idx_game_results_date ON game_results(date);
      `);

      // Crear la tabla de clientes si no existe
      await pool.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          video_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear la tabla de usuarios si no existe
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          client_id INTEGER REFERENCES clients(id),
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'client')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Tablas creadas o ya existentes');
    } catch (error) {
      console.error('Error al crear las tablas:', error);
      throw error;
    }
  }

  static async saveResult(clientId, result, date, phoneNumber) {
    try {
      const queryResult = await pool.query(
        'INSERT INTO game_results (client_id, result, date, phone_number) VALUES ($1, $2, $3, $4) RETURNING id',
        [clientId, result, date, phoneNumber]
      );
      return queryResult.rows[0];
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      throw error;
    }
  }

  static async getResultsByClient(clientId) {
    try {
      const result = await pool.query(
        'SELECT * FROM game_results WHERE client_id = $1 ORDER BY date DESC',
        [clientId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      throw error;
    }
  }

  static async getResultsWithFilters(page = 1, limit = 10, client, date) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT gr.*, c.name as client_name 
        FROM game_results gr 
        LEFT JOIN clients c ON gr.client_id = c.id::text
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (client) {
        query += ` AND gr.client_id = $${paramIndex}`;
        params.push(client);
        paramIndex++;
      }

      if (date) {
        query += ` AND DATE(gr.date) = $${paramIndex}`;
        params.push(date);
        paramIndex++;
      }

      // Obtener el total de resultados
      const countQuery = query.replace('SELECT gr.*, c.name as client_name', 'SELECT COUNT(*)');
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Agregar ordenamiento y paginación
      query += ` ORDER BY gr.date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const results = await pool.query(query, params);
      
      return {
        results: results.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      throw error;
    }
  }
}

module.exports = GameResult; 