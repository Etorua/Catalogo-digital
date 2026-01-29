const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function applyChatbotMigration() {
    try {
        console.log('🤖 Aplicando migración de Chatbot Knowledge...');
        const sql = fs.readFileSync(path.join(__dirname, 'update_chatbot_schema.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Tabla chatbot_knowledge creada/verificada.');
    } catch (err) {
        console.error('❌ Error migrando chatbot:', err);
    }
}

applyChatbotMigration();
