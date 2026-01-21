require('dotenv').config();
const { pool } = require('./db');

const migrate = async () => {
    try {
        console.log('Iniciando migración de mejoras CRM/Marketing...');

        // 1. Crear tabla de Campañas de Marketing (Banners y Anuncios)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS marketing_campaigns (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url TEXT NOT NULL,
                target_link VARCHAR(255),
                position VARCHAR(50) DEFAULT 'home_banner', -- 'home_banner', 'popup', 'sidebar_ad'
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                clicks INTEGER DEFAULT 0
            );
        `);
        console.log('✅ Tabla marketing_campaigns lista.');

        // 2. Insertar datos de prueba si está vacía
        const check = await pool.query('SELECT COUNT(*) FROM marketing_campaigns');
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO marketing_campaigns (title, image_url, position, is_active) VALUES
                ('Oferta Verano', 'https://placehold.co/1200x300/0284c7/white?text=Gran+Venta+de+Verano', 'home_banner', true),
                ('Promo Taladros', 'https://placehold.co/400x300/e11d48/white?text=20%25+OFF+en+Taladros', 'sidebar_ad', true);
            `);
            console.log('✅ Datos de prueba de marketing insertados.');
        }

        console.log('Migración completada con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('Error en migración:', err);
        process.exit(1);
    }
};

migrate();
