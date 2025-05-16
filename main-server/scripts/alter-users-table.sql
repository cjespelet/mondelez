-- Agregar la columna role a la tabla users
ALTER TABLE public.users
ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client'));

-- Comentario para documentación
COMMENT ON COLUMN public.users.role IS 'Rol del usuario: admin o client'; 