require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'catalog_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const initPages = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS static_pages (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT
            );
        `);

        // Datos iniciales
        const initialPages = [
            {
                slug: 'help',
                title: 'Preguntas Frecuentes',
                content: '<h2>Preguntas Frecuentes</h2><p>Aquí encontrarás respuesta a las dudas más comunes sobre envíos, pagos y cuentas.</p><h3>¿Cómo puedo rastrear mi pedido?</h3><p>Ingresa a tu cuenta y ve a la sección "Mis Pedidos".</p>'
            },
            {
                slug: 'returns',
                title: 'Envíos y Devoluciones',
                content: '<h2>Política de Envíos y Devoluciones</h2><p>Aceptamos devoluciones dentro de los 30 días posteriores a la compra siempre que el producto esté en su empaque original.</p>'
            },
            {
                slug: 'invoice',
                title: 'Facturación Electrónica',
                content: '<h2>Portal de Facturación</h2><p>Para generar tu factura necesitas tu ticket de compra y RFC.</p><p>Envía tus datos a facturacion@procenter.com</p>'
            },
            {
                slug: 'warranty',
                title: 'Garantías',
                content: '<h2>Garantías</h2><p>Todos nuestros productos cuentan con garantía de fabricante de al menos 1 año.</p>'
            },
            {
                slug: 'contact',
                title: 'Contacto',
                content: '<h2>Contáctanos</h2><p>Teléfono: 800 PRO CENTER</p><p>Email: contacto@procenter.com</p><p>Horario: Lunes a Viernes 8am - 8pm</p>'
            }
        ];

        for (const page of initialPages) {
            await client.query(`
                INSERT INTO static_pages (slug, title, content)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO NOTHING;
            `, [page.slug, page.title, page.content]);
        }

        console.log("Tabla static_pages creada e inicializada.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.release();
        pool.end();
    }
};

initPages();
