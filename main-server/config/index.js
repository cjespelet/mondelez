module.exports = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/memory_game',
    dialect: 'postgres'
  },
  clients: {
    default: {
      name: 'default',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // URL de video por defecto
    }
  }
}; 