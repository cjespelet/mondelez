const sequelize = require('../config/database');
const Client = require('../models/Client');
const User = require('../models/User');
const config = require('../config/config');

async function initializeDatabase() {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ force: true });
    console.log('Base de datos sincronizada');

    // Crear cliente por defecto
    const defaultClient = await Client.create({
      name: 'default',
      videoUrl: config.clients.default.videoUrl
    });
    console.log('Cliente por defecto creado');

    // Crear usuario de prueba
    await User.create({
      username: 'admin',
      password: 'admin123',
      clientId: defaultClient.id
    });
    console.log('Usuario de prueba creado');

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase(); 