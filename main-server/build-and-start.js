const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando proceso de build...\n');

// Ruta al proyecto Angular
const angularProjectPath = path.join(__dirname, '../public-web');

// Verificar si existe el proyecto Angular
if (!fs.existsSync(angularProjectPath)) {
  console.error('❌ No se encontró el proyecto Angular en:', angularProjectPath);
  process.exit(1);
}

// Verificar si existe package.json
const angularPackageJson = path.join(angularProjectPath, 'package.json');
if (!fs.existsSync(angularPackageJson)) {
  console.error('❌ No se encontró package.json en el proyecto Angular');
  process.exit(1);
}

try {
  console.log('📦 Instalando dependencias de Angular...');
  execSync('npm install', { 
    cwd: angularProjectPath, 
    stdio: 'inherit' 
  });

  console.log('\n🔨 Construyendo aplicación Angular...');
  execSync('npm run build', { 
    cwd: angularProjectPath, 
    stdio: 'inherit' 
  });

  console.log('\n✅ Build completado exitosamente!\n');
  
  // Iniciar el servidor
  console.log('🌐 Iniciando servidor...\n');
  require('./server.js');
  
} catch (error) {
  console.error('\n❌ Error durante el build:', error.message);
  process.exit(1);
}
