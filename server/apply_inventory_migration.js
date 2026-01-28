require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'update_inventory_schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migración de inventario completada exitosamente');
  } catch (err) {
    console.error('Error aplicando migración de inventario:', err);
  } finally {
    process.exit();
  }
}

applyMigration();
