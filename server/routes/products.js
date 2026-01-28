const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. Obtener Productos con Filtros
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, inStock, page = 1, limit = 9 } = req.query;
    
    let queryText = 'SELECT * FROM products WHERE 1=1';
    let countQueryText = 'SELECT COUNT(*) FROM products WHERE 1=1';
    let queryParams = [];
    let paramCount = 1;

    // Filtro por Texto (Buscador)
    if (search) {
        const searchClause = ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR sku ILIKE $${paramCount})`;
        queryText += searchClause;
        countQueryText += searchClause;
        queryParams.push(`%${search}%`);
        paramCount++;
    }

    // Filtro por Categoría
    if (category) {
        queryText += ` AND category = $${paramCount}`;
        countQueryText += ` AND category = $${paramCount}`;
        queryParams.push(category);
        paramCount++;
    }

    // Filtro por Precio Minimo
    if (minPrice) {
        queryText += ` AND price_base >= $${paramCount}`;
        countQueryText += ` AND price_base >= $${paramCount}`;
        queryParams.push(parseFloat(minPrice));
        paramCount++;
    }

    // Filtro por Precio Maximo
    if (maxPrice) {
        queryText += ` AND price_base <= $${paramCount}`;
        countQueryText += ` AND price_base <= $${paramCount}`;
        queryParams.push(parseFloat(maxPrice));
        paramCount++;
    }

    // Filtro por Stock
    if (inStock === 'true') {
        const stockClause = ` AND stock > 0`;
        queryText += stockClause;
        countQueryText += stockClause;
    }

    // Ordenamiento
    if (sort) {
        switch(sort) {
            case 'price_asc':
                queryText += ` ORDER BY price_base ASC`;
                break;
            case 'price_desc':
                queryText += ` ORDER BY price_base DESC`;
                break;
            case 'name_asc':
                queryText += ` ORDER BY title ASC`;
                break;
            default:
                queryText += ` ORDER BY id ASC`; 
                break;
        }
    } else {
        queryText += ` ORDER BY id ASC`;
    }

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    
    const totalResult = await pool.query(countQueryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    queryParams.push(limitNum);
    queryParams.push(offset);
    
    const productsResult = await pool.query(queryText, queryParams);

    // Procesar resultados
    const processedProducts = productsResult.rows.map(p => {
        if (!p.images || p.images.length === 0) {
            return { 
                ...p, 
                images: ['https://dummyimage.com/400x400/f8f9fa/555.png&text=No+Disponible'] 
            };
        }
        return p;
    });

    res.json({
        data: processedProducts,
        pagination: {
            total: totalItems,
            currentPage: pageNum,
            totalPages: Math.ceil(totalItems / limitNum),
            limit: limitNum
        }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// 2. Obtener Producto Individual
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
             return res.status(400).json({ msg: "ID inválido" });
        }

        const result = await pool.query('SELECT * FROM products WHERE id = $1', [numericId]);
        
        if (result.rows.length > 0) {
            const product = result.rows[0];
            if (!product.images || product.images.length === 0) {
                product.images = ['https://dummyimage.com/600x400/e0e0e0/000000.png&text=Sin+Imagen'];
            }
            res.json(product);
        } else {
            res.status(404).json({ msg: "Producto no encontrado" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 4. Crear Producto
router.post('/', async (req, res) => {
    try {
        const { 
            sku, title, description, stock, price_base, category, images, is_best_price, is_featured,
            brand, barcode, location, cost_price, stock_min, stock_max, rubro, unit, tax_rate, supplier_code, weight
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO products (
                sku, title, description, stock, price_base, category, images, lead_score, is_best_price, is_featured,
                brand, barcode, location, cost_price, stock_min, stock_max, rubro, unit, tax_rate, supplier_code, weight
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 5, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
            [
                sku, title, description, stock || 0, price_base, category, images, is_best_price || false, is_featured || false,
                brand || null, barcode || null, location || '', cost_price || 0, stock_min || 0, stock_max || 1000, rubro || 'General', 
                unit || 'un', tax_rate || 0, supplier_code || '', weight || 0
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// 5. Actualizar Producto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            sku, title, description, stock, price_base, category, images, is_best_price, is_featured,
            brand, barcode, location, cost_price, stock_min, stock_max, rubro, unit, tax_rate, supplier_code, weight
        } = req.body;
        
        const result = await pool.query(
            `UPDATE products SET 
                sku = COALESCE($1, sku), 
                title = COALESCE($2, title), 
                description = COALESCE($3, description), 
                stock = COALESCE($4, stock), 
                price_base = COALESCE($5, price_base), 
                category = COALESCE($6, category), 
                images = COALESCE($7, images),
                is_best_price = COALESCE($8, is_best_price),
                is_featured = COALESCE($9, is_featured),
                brand = COALESCE($10, brand),
                barcode = COALESCE($11, barcode),
                location = COALESCE($12, location),
                cost_price = COALESCE($13, cost_price),
                stock_min = COALESCE($14, stock_min),
                stock_max = COALESCE($15, stock_max),
                rubro = COALESCE($16, rubro),
                unit = COALESCE($17, unit),
                tax_rate = COALESCE($18, tax_rate),
                supplier_code = COALESCE($19, supplier_code),
                weight = COALESCE($20, weight)
             WHERE id = $21 RETURNING *`,
            [
                sku, title, description, stock, price_base, category, images, is_best_price, is_featured,
                brand, barcode, location, cost_price, stock_min, stock_max, rubro, unit, tax_rate, supplier_code, weight,
                id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// 6. Eliminar Producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        res.json({ msg: "Producto eliminado" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
