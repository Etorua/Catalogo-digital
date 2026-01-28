CREATE TABLE IF NOT EXISTS promotion_cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_link VARCHAR(255),
    badge_text VARCHAR(50), -- "-20%", "NUEVO"
    badge_color VARCHAR(50) DEFAULT 'red',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);

INSERT INTO marketing_blocks (slug, type, title, content, image_url, target_link)
VALUES ('promo_main_banner', 'banner', 'GRAN LIQUIDACIÓN', '"Hasta 40% de descuento en Pinturas e Impermeabilizantes"', '', '/?category=Pinturas')
ON CONFLICT (slug) DO NOTHING;
