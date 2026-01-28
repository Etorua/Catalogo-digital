const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener clientes (con búsqueda)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let queryText = 'SELECT * FROM clients WHERE 1=1';
        let queryParams = [];

        if (search) {
            queryText += ` AND (full_name ILIKE $1 OR rfc ILIKE $1 OR email ILIKE $1)`;
            queryParams.push(`%${search}%`);
        }

        queryText += ' ORDER BY full_name ASC';

        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching clients' });
    }
});

// Crear cliente
router.post('/', async (req, res) => {
    try {
        const { full_name, rfc, email, phone, address, colonia, city, state, zip_code, credit_limit, notes } = req.body;
        
        const result = await pool.query(
            `INSERT INTO clients (full_name, rfc, email, phone, address, colonia, city, state, zip_code, credit_limit, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [full_name, rfc, email, phone, address, colonia, city, state, zip_code, credit_limit || 0, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating client' });
    }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, rfc, email, phone, address, colonia, city, state, zip_code, credit_limit, notes } = req.body;

        const result = await pool.query(
            `UPDATE clients 
             SET full_name=$1, rfc=$2, email=$3, phone=$4, address=$5, colonia=$6, city=$7, state=$8, zip_code=$9, credit_limit=$10, notes=$11
             WHERE id=$12 RETURNING *`,
            [full_name, rfc, email, phone, address, colonia, city, state, zip_code, credit_limit, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating client' });
    }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: Check if client has debts or history before delete
        await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        res.json({ message: 'Client deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting client' });
    }
});

module.exports = router;
