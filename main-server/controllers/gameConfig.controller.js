const Game = require('../models/game.model');

class GameConfigController {
  static async getAllGames(req, res) {
    try {
      const games = await Game.getAll();
      return res.json({ success: true, games });
    } catch (error) {
      console.error('Error getting games:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener juegos' });
    }
  }

  static async getClientGames(req, res) {
    try {
      const { clientId } = req.params;
      const games = await Game.getClientGames(parseInt(clientId));
      return res.json({ success: true, games });
    } catch (error) {
      console.error('Error getting client games:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener juegos del cliente' });
    }
  }

  static async assignGames(req, res) {
    try {
      const { clientId } = req.params;
      const { gameIds } = req.body;
      
      if (!Array.isArray(gameIds)) {
        return res.status(400).json({ success: false, message: 'gameIds debe ser un array' });
      }

      await Game.assignGamesToClient(parseInt(clientId), gameIds.map(id => parseInt(id)));
      return res.json({ success: true, message: 'Juegos asignados correctamente' });
    } catch (error) {
      console.error('Error assigning games:', error);
      return res.status(500).json({ success: false, message: 'Error al asignar juegos' });
    }
  }

  static async getClientPrizes(req, res) {
    try {
      const { clientId } = req.params;
      const prizes = await Game.getClientPrizes(parseInt(clientId));
      return res.json({ success: true, prizes });
    } catch (error) {
      console.error('Error getting client prizes:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener premios' });
    }
  }

  static async saveClientPrizes(req, res) {
    try {
      const { clientId } = req.params;
      const { prizes } = req.body;
      
      console.log('saveClientPrizes controller - clientId:', clientId, 'prizes:', prizes);
      
      if (!Array.isArray(prizes)) {
        console.error('prizes is not an array:', typeof prizes, prizes);
        return res.status(400).json({ success: false, message: 'prizes debe ser un array' });
      }

      await Game.saveClientPrizes(parseInt(clientId), prizes);
      return res.json({ success: true, message: 'Premios guardados correctamente' });
    } catch (error) {
      console.error('Error saving client prizes:', error);
      return res.status(500).json({ success: false, message: 'Error al guardar premios: ' + error.message });
    }
  }
}

module.exports = GameConfigController;

