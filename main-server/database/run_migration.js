const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/database');

const pool = new Pool(config);

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Leer y ejecutar todos los archivos de migración en orden
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Asegura que se ejecuten en orden alfabético

    for (const file of migrationFiles) {
      console.log(`Ejecutando migración: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await client.query(migrationSQL);
    }
    
    await client.query('COMMIT');
    console.log('Migraciones ejecutadas exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ejecutando las migraciones:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error); 