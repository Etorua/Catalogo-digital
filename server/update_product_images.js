require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const run = async () => {
  const client = await pool.connect();
  try {
    const updateQuery = `
      UPDATE products
      SET images = ARRAY[
        'https://dummyimage.com/600x400/efefef/333.png&text=' ||
        regexp_replace(COALESCE(sku, 'Producto'), '[^a-zA-Z0-9]+', '+', 'g')
      ]
      WHERE images IS NULL
         OR array_length(images, 1) IS NULL
         OR array_length(images, 1) = 0
         OR images[1] LIKE 'https://dummyimage.com/%';
    `;

    const result = await client.query(updateQuery);
    console.log(`Imágenes actualizadas para ${result.rowCount} productos.`);
  } catch (error) {
    console.error('Error actualizando imágenes:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();