
-- Table: Cash Registers (Sesiones de Caja)
CREATE TABLE IF NOT EXISTS cash_registers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- REFERENCES users(id) -- Link to user if auth is fully enforced
    opening_amount DECIMAL(12, 2) NOT NULL,
    closing_amount DECIMAL(12, 2),
    calculated_amount DECIMAL(12, 2), -- System calculated total at closing
    opening_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closing_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
    notes TEXT
);

-- Table: Cash Movements (Movimientos individuales)
CREATE TABLE IF NOT EXISTS cash_movements (
    id SERIAL PRIMARY KEY,
    register_id INTEGER REFERENCES cash_registers(id),
    type VARCHAR(20) NOT NULL, -- 'opening', 'sale', 'expense', 'withdrawal', 'deposit', 'closing'
    amount DECIMAL(12, 2) NOT NULL, -- Positive for money in, negative for money out usually, but we can track direction by type
    description TEXT,
    order_id INTEGER, -- Optional link to orders table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movements_register ON cash_movements(register_id);
