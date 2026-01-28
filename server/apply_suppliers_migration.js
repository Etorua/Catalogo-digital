require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'update_suppliers_schema.sql'), 'utf8');
    console.log('Aplicando migración de Proveedores...');
    await pool.query(sql);
    console.log('Migración de Proveedores completada exitosamente');
  } catch (err) {
    console.error('Error aplicando migración de Proveedores:', err);
  } finally {
    process.exit();
  }
}

applyMigration();
