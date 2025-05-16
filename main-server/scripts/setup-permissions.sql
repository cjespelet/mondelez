-- Conectar como superusuario
\c postgres postgres

-- Crear el usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'memory_game_user') THEN
        CREATE USER memory_game_user WITH PASSWORD 'memory_game_password';
    END IF;
END
$$;

-- Crear la base de datos si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'memory_game') THEN
        CREATE DATABASE memory_game;
    END IF;
END
$$;

-- Conceder todos los permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE memory_game TO memory_game_user;

-- Conectar a la base de datos
\c memory_game postgres

-- Conceder permisos en el esquema público
GRANT ALL PRIVILEGES ON SCHEMA public TO memory_game_user;

-- Conceder permisos en todas las tablas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO memory_game_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO memory_game_user;

-- Conceder permisos explícitos para la tabla users
GRANT ALL PRIVILEGES ON TABLE users TO memory_game_user;
GRANT ALL PRIVILEGES ON TABLE clients TO memory_game_user;

-- Asegurar que los permisos se apliquen a las nuevas tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO memory_game_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO memory_game_user;

-- Verificar los permisos
\dp users
\dp clients 