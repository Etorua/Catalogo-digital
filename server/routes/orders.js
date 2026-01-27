const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener todas las órdenes (Admin)
router.get('/admin', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, COUNT(oi.id) as items_count 
            FROM orders o 
            LEFT JOIN order_items oi ON o.id = oi.order_id 
            GROUP BY o.id 
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Obtener detalle de una orden (Admin)
router.get('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Orden no encontrada' });
        }

        const itemsResult = await pool.query(`
            SELECT oi.*, p.title, p.sku, p.images 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = $1
        `, [id]);

        res.json({
            ...orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Actualizar estatus de orden
router.put('/admin/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        res.json({ msg: 'Estatus actualizado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id, items, total, customer_name, customer_email, shipping_address, shipping_city, shipping_zip } = req.body;

        await client.query('BEGIN');

        // 1. Crear Orden
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total, status, customer_name, customer_email, shipping_address, shipping_city, shipping_zip) 
             VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7) RETURNING id`,
            [user_id || null, total, customer_name, customer_email, shipping_address, shipping_city, shipping_zip]
        );
        const orderId = orderResult.rows[0].id;

        // 2. Crear Detalle de Orden (Items)
        for (const item of items) {
             const subtotal = item.price * item.quantity;
             await client.query(
                 `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                  VALUES ($1, $2, $3, $4, $5)`,
                 [orderId, item.id, item.quantity, item.price, subtotal]
             );
             
             // Opcional: Descontar stock
             await client.query(
                 `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                 [item.quantity, item.id]
             );
        }

        await client.query('COMMIT');
        
        res.status(201).json({ 
            msg: 'Orden creada exitosamente', 
            orderId: orderId 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creando orden:', err.message);
        res.status(500).send('Server Error: ' + err.message);
    } finally {
        client.release();
    }
});

module.exports = router;
