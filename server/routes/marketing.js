const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener campañas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM marketing_campaigns ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.json([]);
    }
});

// Crear campaña
router.post('/', async (req, res) => {
    try {
        const { title, image_url, target_link, position, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO marketing_campaigns (title, image_url, target_link, position, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, image_url, target_link, position, is_active]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Actualizar campaña
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image_url, target_link, position, is_active } = req.body;
        const result = await pool.query(
            'UPDATE marketing_campaigns SET title = $1, image_url = $2, target_link = $3, position = $4, is_active = $5 WHERE id = $6 RETURNING *',
            [title, image_url, target_link, position, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Eliminar campaña
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM marketing_campaigns WHERE id = $1', [id]);
        res.json({ msg: "Campaña eliminada" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
