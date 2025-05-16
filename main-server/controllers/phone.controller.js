const pool = require('../config/database');

const savePhoneNumber = async (req, res) => {
  try {
    const { clientId, phoneNumber, result } = req.body;

    if (!clientId || !phoneNumber || !result) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el cliente existe
    const clientExists = await pool.query(
      'SELECT id FROM clients WHERE id = $1',
      [clientId]
    );

    if (clientExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Guardar el número de teléfono
    const queryResult = await pool.query(
      `INSERT INTO phone_numbers (client_id, phone_number, game_result) 
       VALUES ($1, $2, $3) 
       RETURNING id, client_id, phone_number, game_result, created_at`,
      [clientId, phoneNumber, result]
    );

    res.status(201).json({
      success: true,
      phoneNumber: queryResult.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar número de teléfono:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el número de teléfono'
    });
  }
};

module.exports = {
  savePhoneNumber
}; 