const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// --- HELPER: Get Active Register ---
async function getActiveRegister() {
    // Assuming single active register for now, or filter by user if auth passed
    const res = await pool.query("SELECT * FROM cash_registers WHERE status = 'open' ORDER BY id DESC LIMIT 1");
    return res.rows[0];
}

// GET /status - Check if there is an open register
router.get('/status', async (req, res) => {
    try {
        const register = await getActiveRegister();
        if (!register) {
            return res.json({ isOpen: false });
        }

        // Calculate current balance
        const movementsRes = await pool.query(
            "SELECT * FROM cash_movements WHERE register_id = $1 ORDER BY created_at DESC", 
            [register.id]
        );
        const movements = movementsRes.rows;
        
        let currentBalance = 0;
        movements.forEach(m => {
            if (['deposit', 'sale', 'opening'].includes(m.type)) {
                currentBalance += parseFloat(m.amount);
            } else if (['withdrawal', 'expense'].includes(m.type)) {
                currentBalance -= parseFloat(m.amount);
            }
        });

        res.json({ 
            isOpen: true, 
            register, 
            currentBalance,
            movements 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error checking cash status' });
    }
});

// POST /open - Open a new register
router.post('/open', async (req, res) => {
    try {
        const { amount, notes } = req.body;
        const active = await getActiveRegister();
        if (active) {
            return res.status(400).json({ error: 'Ya existe una caja abierta' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const insertReg = `
                INSERT INTO cash_registers (opening_amount, opening_time, status, notes)
                VALUES ($1, NOW(), 'open', $2)
                RETURNING *
            `;
            const regResult = await client.query(insertReg, [amount, notes]);
            const newRegister = regResult.rows[0];

            // Record initial movement
            const insertMov = `
                INSERT INTO cash_movements (register_id, type, amount, description, created_at)
                VALUES ($1, 'opening', $2, 'Apertura de Caja', NOW())
            `;
            await client.query(insertMov, [newRegister.id, amount]);

            await client.query('COMMIT');
            res.json(newRegister);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error opening register' });
    }
});

// POST /close - Close the register
router.post('/close', async (req, res) => {
    try {
        const { closing_amount, notes } = req.body;
        const register = await getActiveRegister();
        
        if (!register) {
            return res.status(400).json({ error: 'No hay caja abierta' });
        }

        // Calculate expected amount
        const movementsRes = await pool.query("SELECT * FROM cash_movements WHERE register_id = $1", [register.id]);
        let calculated = parseFloat(register.opening_amount);
        // Note: opening_amount is already in movements as 'opening' type usually? 
        // Wait, in /open I inserted it. 
        // If I iterate movements, I should handle 'opening' correctly.
        // My /status logic added opening_amount + movements. 
        // If I have a movement of type 'opening', I shouldn't double count it if I start from 0.
        // Let's verify /status logic. 
        // In /status: start = opening_amount. Loop: add/sub movements.
        // In /open: I inserted a movement 'opening'.
        // So in /status, I am double counting if I start with opening_amount AND add the movement.
        // CORRECTION: Start with 0.
        
        // Recalculating efficiently
        let systemTotal = 0;
        movementsRes.rows.forEach(m => {
             // opening is a type, so it adds to 0. Correct.
             if (['opening', 'sale', 'deposit'].includes(m.type)) {
                 systemTotal += parseFloat(m.amount);
             } else {
                 systemTotal -= parseFloat(m.amount);
             }
        });

        const updateQuery = `
            UPDATE cash_registers 
            SET closing_amount = $1, calculated_amount = $2, closing_time = NOW(), status = 'closed', notes = $3
            WHERE id = $4
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [closing_amount, systemTotal, notes, register.id]);
        
        // Add a closing movement record? Not strictly necessary but good for logs. 
        // The 'closing_amount' is what the user counted. 
        
        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error closing register' });
    }
});

// POST /movement - Add expense/deposit
router.post('/movement', async (req, res) => {
    try {
        const { type, amount, description } = req.body;
        const register = await getActiveRegister();
        if (!register) return res.status(400).json({ error: 'No hay caja abierta' });

        const result = await pool.query(
            `INSERT INTO cash_movements (register_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *`,
            [register.id, type, amount, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating movement' });
    }
});

module.exports = router;
