# Juego de Memoria Interactivo

Este proyecto consiste en un juego de memoria interactivo diseñado para tablets, con un video de fondo de YouTube y un juego de cartas.

## Estructura del Proyecto

- `main-server/`: Servidor Node.js que maneja la API y la base de datos
- `public-web/`: Aplicación Angular que contiene el juego

## Requisitos

- Node.js 16.7.0 o superior
- MongoDB
- Angular CLI 12.2.18

## Instalación

1. Clonar el repositorio
2. Instalar dependencias del servidor:
   ```bash
   cd main-server
   npm install
   ```
3. Instalar dependencias de la aplicación web:
   ```bash
   cd ../public-web
   npm install
   ```

## Configuración

1. Configurar la base de datos en `main-server/config.js`
2. Inicializar la base de datos:
   ```bash
   cd main-server
   npm run init-db
   ```

## Ejecución

1. Iniciar el servidor:
   ```bash
   cd main-server
   npm run dev
   ```
2. En otra terminal, iniciar la aplicación web:
   ```bash
   cd public-web
   ng serve
   ```

## Características

- Video de fondo de YouTube configurable por cliente
- Juego de memoria con 24 cartas
- Diseño responsive para tablets
- Sistema de mensajes para victoria/derrota
- Reinicio automático del juego

## API Endpoints

- `GET /api/video-url`: Obtiene la URL del video para un cliente específico
- `GET /api/client-config`: Obtiene la configuración completa de un cliente

## Licencia

MIT 