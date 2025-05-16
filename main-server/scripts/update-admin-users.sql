-- Actualizar usuarios existentes que deberían ser admin
-- Reemplaza 'username1', 'username2' con los nombres de usuario de los administradores
UPDATE public.users
SET role = 'admin'
WHERE username IN ('username1', 'username2'); 