require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const setup = async () => {
    // 1. Conectar a 'postgres' para crear la base de datos
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Conectar a base de datos por defecto
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        console.log('Conectado a postgres...');
        
        // Verificar si existe la base de datos
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'catalog_db'");
        if (res.rowCount === 0) {
            console.log("Creando base de datos 'catalog_db'...");
            await client.query('CREATE DATABASE catalog_db');
            console.log("Base de datos creada.");
        } else {
            console.log("La base de datos 'catalog_db' ya existe.");
        }
        await client.end();

        // 2. Conectar a la nueva base de datos para crear tablas
        const newPool = new Client({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: 'catalog_db',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432,
        });

        await newPool.connect();
        console.log('Conectado a catalog_db. Creando tablas...');

        // Leer SQL original
        // Nota: Omitimos las primeras líneas de CREATE DATABASE del archivo sql si las hubiera
        const sqlPath = path.join(__dirname, 'database.sql');
        let sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Limpieza simple: quitar comandos de psql como \c
        sqlContent = sqlContent.replace(/\\c catalog_db/g, '');
        sqlContent = sqlContent.replace(/CREATE DATABASE catalog_db;/g, '');

        // Ejecutar SQL base (Productos, Usuarios, etc.)
        await newPool.query(sqlContent);
        console.log('✅ Tablas base creadas.');

        // 3. Crear Tablas de Marketing (CRM)
        await newPool.query(`
            CREATE TABLE IF NOT EXISTS marketing_campaigns (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url TEXT NOT NULL,
                target_link VARCHAR(255),
                position VARCHAR(50) DEFAULT 'home_banner',
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                clicks INTEGER DEFAULT 0
            );
        `);
        console.log('✅ Tabla marketing_campaigns lista.');

         // Insertar datos de prueba de marketing
         const check = await newPool.query('SELECT COUNT(*) FROM marketing_campaigns');
         if (parseInt(check.rows[0].count) === 0) {
             await newPool.query(`
                 INSERT INTO marketing_campaigns (title, image_url, position, is_active) VALUES
                 ('Oferta Verano', 'https://placehold.co/1200x300/0284c7/white?text=Gran+Venta+de+Verano', 'home_banner', true),
                 ('Promo Taladros', 'https://placehold.co/400x300/e11d48/white?text=20%25+OFF+en+Taladros', 'sidebar_ad', true);
             `);
             console.log('✅ Datos de prueba de marketing insertados.');
         }

         // Crear tabla static_pages si no existe (la vimos en index.js pero no en database.sql original)
         await newPool.query(`
            CREATE TABLE IF NOT EXISTS static_pages (
                slug VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL
            );
        `);
        console.log('✅ Tabla static_pages lista.');

        await newPool.end();
        console.log('Setup completado exitosamente.');
        process.exit(0);

    } catch (err) {
        console.error('Error durante el setup:', err);
        process.exit(1);
    }
};

setup();
