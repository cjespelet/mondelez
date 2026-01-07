const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
const wheelRoutes = require('./routes/wheel.routes');
const gameConfigRoutes = require('./routes/gameConfig.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Función para encontrar la ruta de los archivos estáticos de Angular
function findStaticPath() {
  const possiblePaths = [
    path.join(__dirname, '../public-web/dist/public-web/browser'),
    path.join(__dirname, '../public-web/dist/browser'),
    path.join(__dirname, '../../public-web/dist/public-web/browser'),
    path.join(__dirname, '../../public-web/dist/browser'),
    path.join(__dirname, 'public-web/dist/public-web/browser'),
    path.join(__dirname, 'public-web/dist/browser'),
    // Para Render
    path.join(process.cwd(), 'public-web/dist/public-web/browser'),
    path.join(process.cwd(), 'public-web/dist/browser'),
    path.join(process.cwd(), 'dist/public-web/browser'),
    path.join(process.cwd(), 'dist/browser'),
  ];

  for (const staticPath of possiblePaths) {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`Archivos estáticos encontrados en: ${staticPath}`);
      return staticPath;
    }
  }

  console.warn('⚠️  No se encontraron archivos estáticos de Angular. El frontend no estará disponible.');
  return null;
}

const staticPath = findStaticPath();

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
app.use('/api/wheel', wheelRoutes);
app.use('/api/game-config', gameConfigRoutes);

// Rutas adicionales para compatibilidad
app.post('/api/login', AuthController.login);
app.get('/api/client-config', AuthController.getClientConfig);
app.get('/api/video-url', auth, AuthController.getVideoUrl);
    
// Servir archivos estáticos de Angular (solo si se encontraron)
if (staticPath) {
  app.use(express.static(staticPath));
  
  // Manejar todas las demás rutas (SPA fallback)
  app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        success: false,
        message: 'Frontend no disponible. Archivos estáticos no encontrados.'
      });
    }
  });
} else {
  // Si no hay archivos estáticos, solo responder con un mensaje
  app.get('*', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Frontend no disponible. Por favor, construye la aplicación Angular primero.'
    });
  });
}

// Servir archivos estáticos desde el directorio de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    await GameResult.createTable();
    console.log('Tablas inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar las tablas:', error);
  }
}); 