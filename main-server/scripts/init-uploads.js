const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');
const transitionImagesDir = path.join(uploadsDir, 'transition-images');

// Crear directorio de uploads si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Directorio de uploads creado');
}

// Crear directorio de imágenes de transición si no existe
if (!fs.existsSync(transitionImagesDir)) {
  fs.mkdirSync(transitionImagesDir);
  console.log('Directorio de imágenes de transición creado');
}

console.log('Inicialización de directorios completada'); 