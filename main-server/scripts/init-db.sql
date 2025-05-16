-- Crear la tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar cliente por defecto
INSERT INTO clients (name, video_url)
VALUES ('default', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
ON CONFLICT (name) DO NOTHING;

-- Insertar usuario de prueba para el cliente por defecto
INSERT INTO users (username, password, client_id)
VALUES ('test', 'test123', (SELECT id FROM clients WHERE name = 'default'))
ON CONFLICT (username) DO NOTHING; 