const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }

      // Bypass for fixed report-access credentials
      if (username === 'mdlz' && password === '123456') {
        const token = jwt.sign({ id: 0, username: 'mdlz', role: 'client', client_id: null }, config.jwtSecret, { expiresIn: '1h' });
        return res.json({
          success: true,
          token,
          user: { id: 0, username: 'mdlz', role: 'client', clientId: null }
        });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const isPasswordValid = await User.authenticate(username, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta'
        });
      }

      const token = User.generateToken(user);
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          clientId: user.client_id
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  }

  static async getVideoUrl(req, res) {
    try {
      const clientId = req.user.client_id;
      const client = await User.getClientById(clientId);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        videoUrl: client.video_url,
        transitionImage: client.transition_image ? `/uploads/transition-images/${client.transition_image}` : null
      });
    } catch (error) {
      console.error('Error al obtener configuración del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  }

  static async getClientConfig(req, res) {
    try {
      const { clientId } = req.query;
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'ID de cliente es requerido'
        });
      }

      const client = await User.getClientById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        client: {
          id: client.id,
          name: client.name,
          videoUrl: client.video_url
        }
      });
    } catch (error) {
      console.error('Error al obtener configuración del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  }
}

module.exports = AuthController; 