-- Add columns for product highlighting
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_price BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Ensure marketing_campaigns exists (idempotent check)

-- Table: Marketing Blocks (Banners, Promos, Sections)
CREATE TABLE IF NOT EXISTS marketing_blocks (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'home_main_banner', 'promo_grid_1'
    type VARCHAR(20) DEFAULT 'banner', -- 'banner', 'grid', 'text'
    title VARCHAR(255),
    content JSONB, -- Flexible content (array of items, detailed text, etc)
    image_url VARCHAR(255),
    target_link VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data matching the screenshots
INSERT INTO marketing_blocks (slug, type, title, content, is_active) 
VALUES ('home_promotions', 'grid', 'Promociones Actuales', '[
    {"id": 1, "title": "Pisos", "tag": "Hasta 15% de ahorro", "image": "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop", "link": "/departments/pisos"},
    {"id": 2, "title": "Baños", "tag": "Hasta 40% de ahorro", "image": "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?q=80&w=1200", "link": "/departments/banos"},
    {"id": 3, "title": "Calentadores", "tag": "Hasta 25% de ahorro", "image": "https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1200", "link": "/departments/plomeria"}
]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO marketing_blocks (slug, type, title, image_url, target_link, is_active) 
VALUES ('home_hero_banner', 'banner', 'SOMOS ORGULLOSOS PROVEEDORES', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1200', '/catalog', true)
ON CONFLICT (slug) DO NOTHING;
