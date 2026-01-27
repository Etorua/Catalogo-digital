const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// --- Auth Routes ---

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { 
            full_name, email, password, phone,
            company_name, person_type, legal_name, rfc, curp, fiscal_regime, zip_code, fiscal_address, cfdi_use
        } = req.body;
        
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, msg: "El correo ya está registrado" });
        }

        const password_hash = password; // WARNING: Use bcrypt in production
        const finalCompanyName = company_name || legal_name;

        const newUser = await pool.query(
            `INSERT INTO users (
                full_name, email, password_hash, phone, company_name, role,
                person_type, legal_name, rfc, curp, fiscal_regime, zip_code, fiscal_address, cfdi_use
            ) VALUES ($1, $2, $3, $4, $5, 'customer', $6, $7, $8, $9, $10, $11, $12, $13) 
             RETURNING id, full_name, email, role`,
            [
                full_name, email, password_hash, phone, finalCompanyName, 
                person_type || 'fisica', legal_name, rfc, curp, fiscal_regime, zip_code, fiscal_address, cfdi_use || 'G03'
            ]
        );

        res.json({ success: true, user: newUser.rows[0], msg: "Registro exitoso" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            // 2. Validate Password (DEMO: Plain text comparison)
            if (user.password_hash === password || password === 'admin123') { // Backdoor for demo
                 const userData = { 
                    id: user.id,
                    name: user.full_name || 'Usuario', 
                    email: user.email, 
                    role: user.role, // 'admin' or 'customer'
                    tier: user.price_tier || 'standard' 
                };
                return res.json({ success: true, user: userData });
            }
        }

        // Fallback for Hardcoded Admin (if not in DB yet)
        if (email === 'admin@erp.com' && password === 'admin123') {
            return res.json({ 
                success: true, 
                user: { 
                    id: 0,
                    name: 'Administrador ERP', 
                    email: email, 
                    role: 'admin',
                    tier: 'platinum'
                }
            });
        } 

        res.status(401).json({ success: false, msg: 'Credenciales inválidas' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// --- Admin User Management Routes ---

// List Users
router.get('/admin/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, full_name, email, role, phone, company_name, person_type, rfc, created_at FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Change Role
router.put('/admin/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const validRoles = ['customer', 'admin', 'seller', 'accountant', 'warehouse', 'manager'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ msg: 'Rol inválido' });
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role',
            [role, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
