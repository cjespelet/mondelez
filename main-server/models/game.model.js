const pool = require('../config/database');

class Game {
  static async getAll() {
    const result = await pool.query('SELECT * FROM games ORDER BY id');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getClientGames(clientId) {
    const result = await pool.query(
      `SELECT g.* FROM games g
       INNER JOIN client_x_game cxg ON g.id = cxg.game_id
       WHERE cxg.client_id = $1
       ORDER BY g.id`,
      [clientId]
    );
    return result.rows;
  }

  static async assignGamesToClient(clientId, gameIds) {
    const client = await pool.query('DELETE FROM client_x_game WHERE client_id = $1', [clientId]);
    
    if (gameIds && gameIds.length > 0) {
      const values = gameIds.map((gameId, index) => `($1, $${index + 2})`).join(', ');
      const params = [clientId, ...gameIds];
      const query = `INSERT INTO client_x_game (client_id, game_id) VALUES ${values}`;
      await pool.query(query, params);
    }
    
    return { success: true };
  }

  static async getClientPrizes(clientId) {
    const result = await pool.query(
      'SELECT * FROM client_prizes WHERE client_id = $1 ORDER BY order_index, id',
      [clientId]
    );
    return result.rows;
  }

  static async saveClientPrizes(clientId, prizes) {
    console.log('saveClientPrizes called with:', { clientId, prizes });
    
    await pool.query('DELETE FROM client_prizes WHERE client_id = $1', [clientId]);
    
    if (prizes && prizes.length > 0) {
      const values = prizes.map((prize, index) => {
        const paramIndex = index * 2 + 2;
        return `($1, $${paramIndex}, $${paramIndex + 1})`;
      }).join(', ');
      
      const params = [clientId];
      prizes.forEach((prize, index) => {
        params.push(prize.description || '');
        params.push(prize.order_index !== undefined ? prize.order_index : index);
      });
      
      const query = `INSERT INTO client_prizes (client_id, description, order_index) VALUES ${values}`;
      console.log('Executing query:', query);
      console.log('With params:', params);
      await pool.query(query, params);
      console.log('Prizes inserted successfully');
    } else {
      console.log('No prizes to insert, only deleted existing ones');
    }
    
    return { success: true };
  }
}

module.exports = Game;

