
-- Table structure for 'clients' (Clientes para POS/Facturación)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    rfc VARCHAR(20), -- Tax ID
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    colonia VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(10),
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    current_debt DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_rfc ON clients(rfc);
