require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST || 'dpg-d0jjk8buibrs73d3kgg0-a',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'memory_game_3tzf',
    user: process.env.DB_USER || 'memory_game_3tzf_user',
    password: process.env.DB_PASSWORD || '1GwP5Klclmb7BmYSlzURxNCqgusW3IM8'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  clients: {
    default: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ'
    }
  }
}; 