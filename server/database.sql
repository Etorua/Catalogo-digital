CREATE DATABASE catalog_db;

\c catalog_db;

-- Tabla de Productos (Sincronizada con ERP)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,      -- ID Logístico del ERP
    title VARCHAR(255) NOT NULL,          -- Nombre comercial
    description TEXT,                     -- Descripción dinámica
    stock INTEGER NOT NULL DEFAULT 0,     -- Inventario (ERP)
    price_base DECIMAL(10, 2) NOT NULL,   -- Precio base
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100),                -- Archivado para filtros
    lead_score INTEGER DEFAULT 0,         -- Puntuación CRM
    images TEXT[],                        -- Array de URLs de imágenes
    specs JSONB                           -- Especificaciones técnicas (JSON)
);

-- Tabla de Usuarios (Sincronizada con CRM)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',  -- customer, vip, distributor
    price_tier VARCHAR(50) DEFAULT 'standard' -- standard, gold (-10%), platinum (-20%)
);

-- Tabla de Pedidos (Para enviar al ERP)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, synced_erp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos Semilla (Mock Data)
INSERT INTO products (sku, title, description, stock, price_base, category, lead_score, images, specs) VALUES
('SKU001', 'Mezcladora Industrial 2000', 'Mezcladora de alto rendimiento para concreto y materiales densos.', 15, 1200.00, 'Maquinaria', 10, ARRAY['/assets/mixer.jpg'], '{"potencia": "2000W", "peso": "50kg"}'),
('SKU002', 'Guantes de Seguridad Pro', 'Guantes resistentes a cortes nivel 5.', 500, 25.00, 'Seguridad', 2, ARRAY['/assets/gloves.jpg'], '{"talla": "L", "material": "Kevlar"}'),
('SKU003', 'Taladro Percutor X5', 'Taladro inalámbrico con batería de litio de larga duración.', 0, 150.00, 'Herramientas', 5, ARRAY['/assets/drill.jpg'], '{"voltaje": "18V", "bateria": "2x 5Ah"}');
