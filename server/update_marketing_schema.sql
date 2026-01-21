-- Add columns for product highlighting
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_price BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Ensure marketing_campaigns exists (idempotent check)
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    target_link TEXT,
    position VARCHAR(50) DEFAULT 'home_hero', -- 'home_hero', 'home_bonus'
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
