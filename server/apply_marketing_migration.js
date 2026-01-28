require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'update_marketing_schema.sql'), 'utf8');
    console.log('Aplicando migración de Marketing...');
    await pool.query(sql);
    console.log('Migración de Marketing completada exitosamente');
  } catch (err) {
    console.error('Error aplicando migración de Marketing:', err);
  } finally {
    process.exit();
  }
}

applyMigration();
