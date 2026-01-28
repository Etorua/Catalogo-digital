require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'update_cash_schema.sql'), 'utf8');
    console.log('Aplicando migración de Caja...');
    await pool.query(sql);
    console.log('Migración de Caja completada exitosamente');
  } catch (err) {
    console.error('Error aplicando migración de Caja:', err);
  } finally {
    process.exit();
  }
}

applyMigration();
