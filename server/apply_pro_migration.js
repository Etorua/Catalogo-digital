require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'update_pro_requests.sql'), 'utf-8');
        await pool.query(sql);
        console.log('Tabla pro_requests creada exitosamente.');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

runMigration();
