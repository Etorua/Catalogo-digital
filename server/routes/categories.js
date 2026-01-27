const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener Categorías Disponibles
router.get('/', async (req, res) => {
    try {
        const categoriesResult = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM products 
            WHERE category IS NOT NULL 
            GROUP BY category
            ORDER BY count DESC
        `);

        // Formato esperado por el frontend: [{ name: 'Categoria', count: 10 }]
        const categoryList = categoriesResult.rows.map(row => ({
            name: row.category,
            count: parseInt(row.count)
        }));

        res.json(categoryList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
