const { exec } = require('child_process');
const path = require('path');

const sqlFilePath = path.join(__dirname, 'setup-permissions.sql');

// Ejecutar el script SQL usando psql como superusuario
exec(`psql -U postgres -f "${sqlFilePath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error ejecutando el script SQL:', error);
    return;
  }
  if (stderr) {
    console.error('Errores durante la ejecución:', stderr);
    return;
  }
  console.log('Permisos configurados correctamente');
  console.log(stdout);
}); 