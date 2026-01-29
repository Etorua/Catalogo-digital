require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.send('Digital Catalog API Running');
});

// Import Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/cash', require('./routes/cash'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/pages', require('./routes/cms'));
app.use('/api/contact', require('./routes/contact')); // Rutas de contacto y formularios
app.use('/api/promotions', require('./routes/promotions')); // Rutas de tarjetas de promoción
app.use('/api/chatbot', require('./routes/chatbot')); // Rutas del Chatbot Manager
app.use('/api', require('./routes/users')); // Handles /auth and /admin endpoints

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
