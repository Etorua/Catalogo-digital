require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { Client, Pool } = require('pg');
const path = require('path');

const csvFilePath = path.join(__dirname, '..', 'inv juli(1).xlsx.csv');

// Configuración para conectar a la DB por defecto 'postgres' para tareas administrativas
const adminConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Conectamos a postgres para crear la otra DB
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

// Configuración de la DB destino
const targetConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const cleanNumber = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const cleaned = value.toString().replace(/,/g, '');
    return parseFloat(cleaned) || 0;
};

const setupDatabase = async () => {
    const client = new Client(adminConfig);
    try {
        await client.connect();
        // Verificar si la base de datos existe
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        if (res.rowCount === 0) {
            console.log(`Creando base de datos ${process.env.DB_NAME}...`);
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log("Base de datos creada.");
        } else {
            console.log("La base de datos ya existe.");
        }
    } catch (e) {
        console.error("Error comprobando/creando base de datos:", e);
        throw e;
    } finally {
        await client.end();
    }
};

const importData = async () => {
    try {
        await setupDatabase();
    } catch (e) {
        console.error("No se pudo configurar la base de datos. Verifique credenciales.", e.message);
        return;
    }

    const pool = new Pool(targetConfig);
    const results = [];
    
    console.log(`Leyendo archivo: ${csvFilePath}`);

    fs.createReadStream(csvFilePath)
        // Usamos mapHeaders para limpiar posibles caracteres ocultos (BOM) en la primera columna
        .pipe(csv({
            mapHeaders: ({ header, index }) => {
                // Eliminar BOM si existe y espacios extra
                return header.replace(/^\ufeff/, '').trim();
            }
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`Leídos ${results.length} registros. Preparando importación (esto puede tardar un poco)...`);
            
            if (results.length > 0) {
                console.log("Ejemplo de primera fila:", results[0]);
                console.log("Claves disponibles:", Object.keys(results[0]));
            }

            const client = await pool.connect();
            try {
                // Borrar tabla anterior para asegurar tipos correctos (stock decimal)
                await client.query('DROP TABLE IF EXISTS products CASCADE');

                // Crear tabla si no existe
                await client.query(`
                    CREATE TABLE IF NOT EXISTS products (
                        id SERIAL PRIMARY KEY,
                        sku VARCHAR(50) UNIQUE NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        stock DECIMAL(12, 3) NOT NULL DEFAULT 0,
                        price_base DECIMAL(10, 2) NOT NULL,
                        currency VARCHAR(3) DEFAULT 'USD',
                        category VARCHAR(100),
                        lead_score INTEGER DEFAULT 0,
                        images TEXT[],
                        specs JSONB
                    );
                `);

                await client.query('BEGIN');

                let insertedCount = 0;
                let updatedCount = 0;
                let loopIndex = 0;

                for (const row of results) {
                    loopIndex++;
                    const sku = row['Material'];
                    
                    if (loopIndex === 1) {
                         console.log("Procesando primer registro:", sku, row['Descripción de Mater']);
                    }

                    if (!sku) {
                        if (loopIndex < 5) console.log("Saltando fila sin SKU:", row);
                        continue;
                    }

                    const title = (row['Descripción de Mater'] || 'Sin Título').substring(0, 255);
                    const description = row['Descripción Larga'] || '';
                    const stock = cleanNumber(row['Stock Total']);
                    const price_base = cleanNumber(row['Precio Variable']);
                    const category = (row['Categoria'] || 'General').substring(0, 100);
                    
                    const specs = {};
                    Object.keys(row).forEach(key => {
                        if (!['Material', 'Descripción de Mater', 'Descripción Larga', 'Stock Total', 'Precio Variable', 'Categoria'].includes(key)) {
                            specs[key] = row[key];
                        }
                    });

                    const query = `
                        INSERT INTO products (sku, title, description, stock, price_base, category, specs, images, currency)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (sku) DO UPDATE SET
                            title = EXCLUDED.title,
                            description = EXCLUDED.description,
                            stock = EXCLUDED.stock,
                            price_base = EXCLUDED.price_base,
                            category = EXCLUDED.category,
                            specs = EXCLUDED.specs
                        RETURNING (xmax = 0) AS inserted;
                    `;
                    
                    const values = [
                        sku, 
                        title, 
                        description, 
                        stock, 
                        price_base, 
                        category, 
                        JSON.stringify(specs),
                        [], 
                        'USD'
                    ];

                    const res = await client.query(query, values);
                    if (res.rows[0].inserted) insertedCount++;
                    else updatedCount++;

                    // Mostrar progreso cada 500 registros
                    if ((insertedCount + updatedCount) % 500 === 0) {
                        console.log(`Procesados: ${insertedCount + updatedCount}...`);
                    }
                }

                await client.query('COMMIT');
                console.log(`===========================================`);
                console.log(`IMPORTACIÓN COMPLETADA`);
                console.log(`Insertados: ${insertedCount}`);
                console.log(`Actualizados: ${updatedCount}`);
                console.log(`Total procesados: ${insertedCount + updatedCount}`);
                console.log(`===========================================`);

            } catch (e) {
                await client.query('ROLLBACK');
                console.error('Error durante la transacción:', e);
            } finally {
                client.release();
                pool.end();
            }
        });
};

importData();
