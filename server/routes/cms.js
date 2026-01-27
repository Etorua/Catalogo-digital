const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener lista de páginas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT slug, title FROM static_pages ORDER BY title');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Obtener página por slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query('SELECT * FROM static_pages WHERE slug = $1', [slug]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ msg: "Página no encontrada" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Actualizar página
router.put('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content } = req.body;
        
        const result = await pool.query(
            'UPDATE static_pages SET title = $1, content = $2 WHERE slug = $3 RETURNING *',
            [title, content, slug]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            // Si no existe, crearla
            const newPage = await pool.query(
                'INSERT INTO static_pages (slug, title, content) VALUES ($1, $2, $3) RETURNING *',
                [slug, title, content]
            );
            res.json(newPage.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
