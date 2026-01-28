const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all blocks (admin needs all, public needs active)
router.get('/', async (req, res) => {
    try {
        const { publicOnly } = req.query;
        let query = 'SELECT * FROM marketing_blocks';
        if (publicOnly === 'true') {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY slug ASC';
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET Single by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query('SELECT * FROM marketing_blocks WHERE slug = $1', [slug]);
        if (result.rows.length === 0) return res.status(404).json({error: 'Not found'});
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Server error'});
    }
});

// PUT Update Block
router.put('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, image_url, target_link, content, is_active } = req.body;
        
        const result = await pool.query(
            `UPDATE marketing_blocks 
             SET title=$1, image_url=$2, target_link=$3, content=$4, is_active=$5 
             WHERE slug=$6 RETURNING *`,
            [title, image_url, target_link, content, is_active, slug]
        );
        res.json(result.rows[0]);
    } catch (err) {
         console.error(err);
         res.status(500).json({error: 'Server error'});
    }
});

// POST Create Block (For new sections)
router.post('/', async (req, res) => {
    try {
        const { slug, type, title, image_url, content } = req.body;
        const result = await pool.query(
            `INSERT INTO marketing_blocks (slug, type, title, image_url, content)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [slug, type, title, image_url, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Server error'});
    }
});

// DELETE Block
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM marketing_blocks WHERE id = $1', [id]);
        res.json({ msg: "Bloque eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
