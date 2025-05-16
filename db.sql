-- Crear la base de datos
CREATE DATABASE memory_game
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectarse a la base de datos


-- Crear la tabla de clientes
CREATE TABLE "clients" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de usuarios
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE
);

-- Insertar datos de prueba
INSERT INTO "Clients" ("name", "videoUrl") VALUES 
('default', 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ');

-- Nota: La contraseña se insertará hasheada, este es solo un ejemplo
INSERT INTO "Users" ("username", "password", "clientId") VALUES 
('admin', '$2a$10$X7J3Y5Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4', 1); 
UPDATE "Users" SET "password" = '$2a$10$X7J3Y5Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4' WHERE "username" = 'admin';

CREATE TABLE game_results (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    result VARCHAR(10) NOT NULL CHECK (result IN ('Winner', 'Lost')),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para mejorar el rendimiento de las consultas
    INDEX idx_client_id (client_id),
    INDEX idx_date (date)
);

-- Comentarios para documentación
COMMENT ON TABLE game_results IS 'Tabla para almacenar los resultados del juego de memoria';
COMMENT ON COLUMN game_results.client_id IS 'ID del cliente que jugó el juego';
COMMENT ON COLUMN game_results.result IS 'Resultado del juego: Ganado o Perdido';
COMMENT ON COLUMN game_results.date IS 'Fecha y hora en que se jugó el juego';
COMMENT ON COLUMN game_results.created_at IS 'Fecha y hora de creación del registro';