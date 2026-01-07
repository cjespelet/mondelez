# Configuración para Render.com

## Opción 1: Build separado (Recomendado)

En la configuración de Render, usa estos valores:

- **Root Directory**: `main-server`
- **Build Command**: 
  ```bash
  cd ../public-web && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  node server.js
  ```

## Opción 2: Build y start en un solo comando

- **Root Directory**: `main-server`
- **Build Command**: (dejar vacío o solo `npm install`)
- **Start Command**: 
  ```bash
  node build-and-start.js
  ```

## Variables de Entorno

Asegúrate de configurar estas variables de entorno en Render:

- `PORT`: Render lo configura automáticamente
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Secret para firmar los tokens JWT
- `NODE_ENV`: `production`

## Notas

- El servidor buscará automáticamente los archivos estáticos de Angular en varias ubicaciones posibles
- Si los archivos no se encuentran, el servidor seguirá funcionando pero solo servirá la API
- Los logs mostrarán dónde se encontraron los archivos estáticos o si no se encontraron
