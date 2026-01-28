const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure upload directory exists
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
    try {
         if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the accessible URL
        // Assuming server is serving 'uploads' static folder at root or /uploads
        // We will configure express.static in index.js
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({ 
            message: 'Image uploaded successfully', 
            url: imageUrl,
            filename: req.file.filename 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error uploading file' });
    }
});

module.exports = router;
