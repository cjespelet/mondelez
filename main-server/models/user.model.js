const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class User {
  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT u.*, c.video_url FROM users u LEFT JOIN clients c ON u.client_id = c.id WHERE u.username = $1',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw error;
    }
  }

  static async authenticate(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) return false;

      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error en autenticación:', error);
      throw error;
    }
  }

  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        client_id: user.client_id
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  static async getClientById(clientId) {
    try {
      const result = await pool.query(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  }
}

module.exports = User; 