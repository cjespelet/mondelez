const { Pool } = require('pg');

const pool = new Pool({
  user: 'memory_game_user',
  host: 'localhost',
  database: 'memory_game',
  password: 'memory_game_password',
  port: 5432,
});

module.exports = pool; 