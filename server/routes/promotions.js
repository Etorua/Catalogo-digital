const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all active promotion cards
router.get('/', async (req, res) => {
    try {
        const { all } = req.query; // ?all=true sends inactive too (for admin)
        let query = 'SELECT * FROM promotion_cards';
        if (all !== 'true') {
            query += ' WHERE is_active = TRUE';
        }
        query += ' ORDER BY display_order ASC, id DESC';
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST create new card
router.post('/', async (req, res) => {
    try {
        const { title, description, target_link, badge_text, badge_color, display_order } = req.body;
        const result = await pool.query(
            'INSERT INTO promotion_cards (title, description, target_link, badge_text, badge_color, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, target_link, badge_text, badge_color, display_order || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT update card
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, target_link, badge_text, badge_color, is_active, display_order } = req.body;
        
        const result = await pool.query(
            'UPDATE promotion_cards SET title=$1, description=$2, target_link=$3, badge_text=$4, badge_color=$5, is_active=$6, display_order=$7 WHERE id=$8 RETURNING *',
            [title, description, target_link, badge_text, badge_color, is_active, display_order, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE card
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM promotion_cards WHERE id = $1', [id]);
        res.json({ msg: 'Card deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
