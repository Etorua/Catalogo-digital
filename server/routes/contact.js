const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/contact/pro-request
router.post('/pro-request', async (req, res) => {
    const { name, company, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ msg: 'Nombre y correo son obligatorios' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO pro_requests (full_name, company_name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, company, email, phone]
        );
        
        res.json({ success: true, data: result.rows[0], msg: 'Solicitud recibida correctamente' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/contact/pro-requests (Admin only ideally, but public for now in this scope)
router.get('/pro-requests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pro_requests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
