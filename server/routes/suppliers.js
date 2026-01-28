const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all suppliers (with search)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let queryText = 'SELECT * FROM suppliers WHERE 1=1';
        let queryParams = [];

        if (search) {
            queryText += ` AND (company_name ILIKE $1 OR rfc ILIKE $1 OR contact_name ILIKE $1)`;
            queryParams.push(`%${search}%`);
        }

        queryText += ' ORDER BY company_name ASC';

        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching suppliers' });
    }
});

// GET By ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching supplier' });
    }
});

// POST Create
router.post('/', async (req, res) => {
    try {
        const { 
            company_name, contact_name, rfc, email, phone, address, 
            city, state, zip_code, website, credit_days, notes 
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO suppliers (
                company_name, contact_name, rfc, email, phone, address, 
                city, state, zip_code, website, credit_days, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *`,
            [company_name, contact_name, rfc, email, phone, address, city, state, zip_code, website, credit_days || 0, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating supplier' });
    }
});

// PUT Update
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            company_name, contact_name, rfc, email, phone, address, 
            city, state, zip_code, website, credit_days, notes 
        } = req.body;

        const result = await pool.query(
            `UPDATE suppliers 
             SET company_name=$1, contact_name=$2, rfc=$3, email=$4, phone=$5, address=$6, 
                 city=$7, state=$8, zip_code=$9, website=$10, credit_days=$11, notes=$12
             WHERE id=$13 RETURNING *`,
            [company_name, contact_name, rfc, email, phone, address, city, state, zip_code, website, credit_days, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating supplier' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting supplier' });
    }
});

module.exports = router;
