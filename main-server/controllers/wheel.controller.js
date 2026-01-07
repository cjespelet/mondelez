const GameResult = require('../models/gameResult.model');
const Game = require('../models/game.model');

class WheelController {
  static async spin(req, res) {
    try {
      const { clientId } = req.body;
      
      if (!clientId) {
        return res.status(400).json({ success: false, message: 'ID de cliente requerido' });
      }

      // Obtener premios personalizados del cliente
      const prizes = await Game.getClientPrizes(parseInt(clientId));
      
      // Función para capitalizar primera letra
      const capitalizeFirst = (str) => {
        if (!str || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      
      // Capitalizar premios
      const formattedPrizes = prizes.map(p => ({
        ...p,
        description: capitalizeFirst(p.description)
      }));
      
      // Intercalar premios con "Seguí participando" hasta completar 6 segmentos
      const segments = [];
      let prizeIndex = 0;
      let currentSegmentIndex = 0;
      
      while (segments.length < 6) {
        if (currentSegmentIndex % 2 === 0 && prizeIndex < formattedPrizes.length) {
          // Posición par: agregar premio
          const prize = formattedPrizes[prizeIndex];
          segments.push({ prize: prize.description, result: 'Ganado' });
          prizeIndex++;
        } else {
          // Posición impar o no hay más premios: agregar "Seguí participando"
          segments.push({ prize: '', result: 'Perdido' });
        }
        currentSegmentIndex++;
      }

      const selectedSegmentIndex = Math.floor(Math.random() * segments.length);
      const segment = segments[selectedSegmentIndex];

      return res.json({
        success: true,
        segmentIndex: selectedSegmentIndex,
        prize: segment.prize,
        result: segment.result
      });
    } catch (error) {
      console.error('Error spinning wheel:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al girar la ruleta'
      });
    }
  }

  static async saveResult(req, res) {
    try {
      const { clientId, result, phoneNumber, prize = '', date } = req.body;

      console.log('Saving wheel result:', { clientId, result, prize, phoneNumber, date });

      if (!clientId) {
        return res.status(400).json({ success: false, message: 'ID de cliente requerido' });
      }

      if (!result || !['Ganado', 'Perdido'].includes(result)) {
        return res.status(400).json({ success: false, message: 'Resultado inválido' });
      }

      if (!date) {
        return res.status(400).json({ success: false, message: 'Fecha requerida' });
      }

      // Si el resultado es "Ganado", el premio debe estar presente
      const prizeToSave = (result === 'Ganado' && prize && prize.trim() !== '') ? prize : null;
      console.log('Prize to save:', prizeToSave);

      const savedResult = await GameResult.saveResult(clientId, result, date, phoneNumber, 'ruleta', prizeToSave);

      return res.json({
        success: true,
        message: 'Resultado guardado',
        id: savedResult.id
      });
    } catch (error) {
      console.error('Error saving wheel result:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al guardar el resultado'
      });
    }
  }

  static async updatePhone(req, res) {
    try {
      const { resultId } = req.params;
      const { phoneNumber } = req.body;

      if (!phoneNumber || phoneNumber.trim() === '') {
        return res.status(400).json({ success: false, message: 'Número de teléfono requerido' });
      }

      await GameResult.updatePhone(parseInt(resultId), phoneNumber);

      return res.json({
        success: true,
        message: 'Teléfono actualizado'
      });
    } catch (error) {
      console.error('Error updating phone:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el teléfono'
      });
    }
  }
}

module.exports = WheelController;


