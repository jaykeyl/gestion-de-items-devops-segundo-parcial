-- la db 'cruddb' ya la crea automáticamente la imagen de Postgres

-- Crear tabla items
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

-- Insertar datos de ejemplo
INSERT INTO items (name, description) VALUES
    ('Laptop Dell XPS 15', 'Portátil de alto rendimiento para desarrollo'),
    ('Mouse Logitech MX Master 3', 'Mouse inalámbrico ergonómico'),
    ('Teclado Mecánico', 'Teclado mecánico RGB para programación')
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente';
END $$;
