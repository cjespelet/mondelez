const pool = require('../config/database');

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos');
    
    // Probar una consulta simple
    const result = await client.query('SELECT current_database(), current_user');
    console.log('Base de datos actual:', result.rows[0].current_database);
    console.log('Usuario actual:', result.rows[0].current_user);
    
    client.release();
  } catch (error) {
    console.error('Error de conexión:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 