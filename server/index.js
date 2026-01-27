require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Digital Catalog API Running');
});

// Import Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/pages', require('./routes/cms'));
app.use('/api', require('./routes/users')); // Handles /auth and /admin endpoints

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
