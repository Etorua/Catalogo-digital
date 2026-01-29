const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. Obtener todas las reglas de conocimiento
router.get('/knowledge', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM chatbot_knowledge ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener conocimiento del bot' });
    }
});

// 2. Crear nueva regla
router.post('/knowledge', async (req, res) => {
    const { keywords, answer } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO chatbot_knowledge (keywords, answer) VALUES ($1, $2) RETURNING *',
            [keywords, answer]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear regla' });
    }
});

// 3. Actualizar regla
router.put('/knowledge/:id', async (req, res) => {
    const { id } = req.params;
    const { keywords, answer, active } = req.body;
    try {
        const result = await pool.query(
            'UPDATE chatbot_knowledge SET keywords = $1, answer = $2, active = $3 WHERE id = $4 RETURNING *',
            [keywords, answer, active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar regla' });
    }
});

// 4. Eliminar regla
router.delete('/knowledge/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM chatbot_knowledge WHERE id = $1', [id]);
        res.json({ message: 'Regla eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar regla' });
    }
});

// 5. Endpoint público para buscar respuesta (usado por el Widget)
router.get('/ask', async (req, res) => {
    const { question } = req.query;
    if (!question) return res.status(400).json({ error: 'Pregunta requerida' });

    try {
        // Lógica simple: Buscar si alguna palabra clave está en la pregunta
        // Esto se puede mejorar con Full Text Search de Postgres, pero iniciamos simple
        const cleanQuestion = question.toLowerCase();
        
        const result = await pool.query('SELECT * FROM chatbot_knowledge WHERE active = TRUE');
        const rules = result.rows;

        let bestMatch = null;

        for (const rule of rules) {
            const keywords = rule.keywords.toLowerCase().split(',').map(k => k.trim());
            
            // Verificar si alguna keyword aparece en la pregunta
            for (const key of keywords) {
                if (cleanQuestion.includes(key)) {
                    bestMatch = rule;
                    break; 
                }
            }
            if (bestMatch) break;
        }

        if (bestMatch) {
            res.json({ found: true, answer: bestMatch.answer });
        } else {
            res.json({ found: false });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error procesando pregunta' });
    }
});

module.exports = router;