-- Permite que el usuario se conecte desde cualquier host ('%') en lugar de solo 'localhost'
GRANT ALL PRIVILEGES ON soren_db.* TO 'soren_user'@'%';
FLUSH PRIVILEGES;