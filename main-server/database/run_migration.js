const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/database');

const pool = new Pool(config);

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Leer y ejecutar el archivo de migración
    const migrationPath = path.join(__dirname, 'migrations', 'add_distributor_to_clients.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migración ejecutada exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ejecutando la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error); 