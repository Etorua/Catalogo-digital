require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'update_promotions_schema.sql'), 'utf-8');
        await pool.query(sql);
        console.log('Tabla promotion_cards y bloque de marketing creados.');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

runMigration();
