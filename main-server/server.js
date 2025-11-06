const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');
const config = require('./config/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const GameResult = require('./models/gameResult.model');
const gameResultRoutes = require('./routes/gameResult.routes');
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const reportRoutes = require('./routes/report.routes');
const ReportController = require('./controllers/report.controller');
const phoneRoutes = require('./routes/phone.routes');
const distributorRoutes = require('./routes/distributor.routes');
const AuthController = require('./controllers/auth.controller');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://mondelez-public-web.onrender.com' // ✅ Agregá el dominio del frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/game-results', gameResultRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/phone-numbers', phoneRoutes);
app.use('/api', reportRoutes);
app.use('/api/distributors', distributorRoutes);

// Rutas adicionales para compatibilidad
app.post('/api/login', AuthController.login);
app.get('/api/client-config', AuthController.getClientConfig);
app.get('/api/video-url', auth, AuthController.getVideoUrl);
    
// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, '../public-web/dist/public-web/browser')));

// Servir archivos estáticos desde el directorio de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Manejar todas las demás rutas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-web/dist/public-web/browser/index.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Ensure tables for reports exist
ReportController.ensureTable();

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  try {
    // Inicializar tablas de la base de datos
    // await GameResult.createTable();
    console.log('Tablas inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar las tablas:', error);
  }
}); 