-- Agregar columna game_type a la tabla game_results si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_results' 
        AND column_name = 'game_type'
    ) THEN
        ALTER TABLE game_results 
        ADD COLUMN game_type VARCHAR(50) NOT NULL DEFAULT 'tapadita';
        
        -- Crear índice para game_type si no existe
        CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON game_results(game_type);
        
        RAISE NOTICE 'Columna game_type agregada a game_results';
    ELSE
        RAISE NOTICE 'La columna game_type ya existe en game_results';
    END IF;
END $$;

-- Agregar columna prize a la tabla game_results si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_results' 
        AND column_name = 'prize'
    ) THEN
        ALTER TABLE game_results 
        ADD COLUMN prize VARCHAR(255);
        
        RAISE NOTICE 'Columna prize agregada a game_results';
    ELSE
        RAISE NOTICE 'La columna prize ya existe en game_results';
    END IF;
END $$;

