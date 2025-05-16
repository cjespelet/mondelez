const { Pool } = require('pg');

const pool = new Pool({
  user: 'memory_game_3tzf_user',
  host: 'dpg-d0jjk8buibrs73d3kgg0-a',
  database: 'memory_game_3tzf',
  password: '1GwP5Klclmb7BmYSlzURxNCqgusW3IM8',
  port: 5432,
});

module.exports = pool; 