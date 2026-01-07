-- Tabla de juegos
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar juegos por defecto
INSERT INTO games (id, name, description) VALUES
  (1, 'tapadita', 'Juego de memoria con cartas'),
  (2, 'ruleta', 'Ruleta de premios')
ON CONFLICT (id) DO NOTHING;

-- Tabla de relación cliente-juego
CREATE TABLE IF NOT EXISTS client_x_game (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, game_id)
);

-- Asignar juego tapadita (id=1) por defecto a todos los clientes existentes
INSERT INTO client_x_game (client_id, game_id)
SELECT id, 1 FROM clients
WHERE NOT EXISTS (
  SELECT 1 FROM client_x_game WHERE client_x_game.client_id = clients.id
)
ON CONFLICT (client_id, game_id) DO NOTHING;

-- Tabla de premios personalizados por cliente para ruleta
CREATE TABLE IF NOT EXISTS client_prizes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_client_x_game_client_id ON client_x_game(client_id);
CREATE INDEX IF NOT EXISTS idx_client_x_game_game_id ON client_x_game(game_id);
CREATE INDEX IF NOT EXISTS idx_client_prizes_client_id ON client_prizes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_prizes_order ON client_prizes(client_id, order_index);

ALTER TABLE game_results 
        ADD COLUMN game_type VARCHAR(50) NOT NULL DEFAULT 'tapadita';
        
        -- Crear índice para game_type si no existe
        CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON game_results(game_type);