-- Crear la base de datos si no existe
CREATE DATABASE mondelez_db;

-- Conectar a la base de datos
\c mondelez_db;

-- Crear las tablas
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    video_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phone_numbers (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    phone_number VARCHAR(20) NOT NULL,
    game_result VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO clients (name, video_url) VALUES
('Cliente 1', 'https://example.com/video1.mp4'),
('Cliente 2', 'https://example.com/video2.mp4')
ON CONFLICT (name) DO NOTHING; 