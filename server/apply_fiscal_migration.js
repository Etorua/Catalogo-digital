require('dotenv').config();
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'update_fiscal_schema.sql'), 'utf8');
        console.log('Running FISCAL migration...');
        await pool.query(sql);
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
