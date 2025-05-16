-- Agregar columna distributor_id a la tabla clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS distributor_id INTEGER REFERENCES distributors(id);

-- Crear índice para mejorar el rendimiento de las búsquedas
CREATE INDEX IF NOT EXISTS idx_clients_distributor_id ON clients(distributor_id); 