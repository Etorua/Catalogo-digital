-- Update Users for Fiscal Data
ALTER TABLE users ADD COLUMN IF NOT EXISTS person_type VARCHAR(20) DEFAULT 'fisica'; -- 'fisica' or 'moral'
ALTER TABLE users ADD COLUMN IF NOT EXISTS rfc VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS curp VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255); -- Razon Social
ALTER TABLE users ADD COLUMN IF NOT EXISTS fiscal_regime VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS fiscal_address TEXT; -- Full address or JSON
ALTER TABLE users ADD COLUMN IF NOT EXISTS cfdi_use VARCHAR(10) DEFAULT 'G03'; -- Uso de CFDI
ALTER TABLE users ADD COLUMN IF NOT EXISTS constancia_fiscal_url TEXT; -- PDF Upload link

-- Ensure roles include new types (Check annotation only, logic is in code)
-- Roles: 'customer', 'admin', 'seller', 'accountant', 'warehouse'
