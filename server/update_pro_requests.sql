CREATE TABLE IF NOT EXISTS pro_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, converted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
