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

// --- Integración con ERP/Base de Datos ---

// 1. Obtener Productos con Filtros (Buscador Inteligente y Paginación)
app.get('/api/products', async (req, res) => {
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

    // Filtro por Stock (Solo disponibles)
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
                queryText += ` ORDER BY id ASC`; // Default sorting to ensure stability
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
    
    // Ejecutar consultas
    const totalResult = await pool.query(countQueryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    // Añadir parámetros de paginación
    queryParams.push(limitNum);
    queryParams.push(offset);
    
    const productsResult = await pool.query(queryText, queryParams);

    // Procesar resultados para añadir imagen por defecto
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

// 1.1 Obtener Categorías Disponibles
app.get('/api/categories', async (req, res) => {
    try {
        const categoriesResult = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM products 
            WHERE category IS NOT NULL 
            GROUP BY category
            ORDER BY count DESC
        `);

        // Formato esperado por el frontend: [{ name: 'Categoria', count: 10 }]
        const categoryList = categoriesResult.rows.map(row => ({
            name: row.category,
            count: parseInt(row.count)
        }));

        res.json(categoryList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. Ficha de Producto Detallada (API)
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar si es un ID numérico para consultar la BD
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
             return res.status(400).json({ msg: "ID inválido" });
        }

        const result = await pool.query('SELECT * FROM products WHERE id = $1', [numericId]);
        
        if (result.rows.length > 0) {
            const product = result.rows[0];
            
            // Asignar imagen por defecto si no tiene
            if (!product.images || product.images.length === 0) {
                product.images = ['https://dummyimage.com/600x400/e0e0e0/000000.png&text=Sin+Imagen'];
            }

            // Simular log de "Lead Score" en CRM al ver detalle
            // En un sistema real, haríamos UPDATE products SET lead_score = lead_score + 1 WHERE id = ...
            console.log(`[CRM] Lead Score +1 for product ID ${product.id}`);
            
            res.json(product);
        } else {
            res.status(404).json({ msg: "Producto no encontrado" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 3. Simulación de Login (CRM - Precios Personalizados)
app.post('/api/login', (req, res) => {
    // Simula recibir credenciales y devolver perfil de cliente con tarifa
    const { username } = req.body;
    const userProfile = {
        name: username,
        role: username === 'admin' ? 'distributor' : 'customer',
        discountCheck: username === 'admin' ? 0.8 : 1.0 // 20% descuento para admins
    };
    res.json(userProfile);
});

// 4. Crear Pedido (Integración ERP)
app.post('/api/orders', async (req, res) => {
    const { items, userId } = req.body; // items: [{sku, quantity}]
    
    // Aquí iría la lógica transaccional:
    // 1. Verificar stock real en DB
    // 2. Crear registro en tabla orders
    // 3. Descontar stock
    // 4. Enviar webhook al ERP real
    
    console.log(`[ERP] Nueva orden recibida de User ${userId}:`, items);
    
    res.json({ success: true, orderId: "ORD-" + Date.now(), msg: "Pedido sincronizado con ERP" });
});

// --- Páginas Dinámicas (Info, Políticas, etc.) ---

// Obtener página por slug
app.get('/api/pages/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query('SELECT * FROM static_pages WHERE slug = $1', [slug]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ msg: "Página no encontrada" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Actualizar página (Solo Admin idealmente)
app.put('/api/pages/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content } = req.body;
        
        const result = await pool.query(
            'UPDATE static_pages SET title = $1, content = $2 WHERE slug = $3 RETURNING *',
            [title, content, slug]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            // Si no existe, crearla
            const newPage = await pool.query(
                'INSERT INTO static_pages (slug, title, content) VALUES ($1, $2, $3) RETURNING *',
                [slug, title, content]
            );
            res.json(newPage.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Obtener lista de páginas
app.get('/api/pages', async (req, res) => {
    try {
        const result = await pool.query('SELECT slug, title FROM static_pages ORDER BY title');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Rutas de Administración (CRUD) ---

// 5. Agregar Producto
app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    newProduct.id = mockProducts.length + 1; // Simple ID gen
    if (!newProduct.images) newProduct.images = ['https://placehold.co/600x400'];
    mockProducts.push(newProduct);
    res.json(newProduct);
});

// 6. Actualizar Producto
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = mockProducts.findIndex(p => p.id == id);
    if (index !== -1) {
        mockProducts[index] = { ...mockProducts[index], ...req.body };
        res.json(mockProducts[index]);
    } else {
        res.status(404).json({ msg: "Producto no encontrado" });
    }
});

// 7. Eliminar Producto
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = mockProducts.findIndex(p => p.id == id);
    if (index !== -1) {
        mockProducts.splice(index, 1);
        res.json({ msg: "Producto eliminado" });
    } else {
        res.status(404).json({ msg: "Producto no encontrado" });
    }
});

// Simulador de Login Admin
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Hardcoded Admin
    if (email === 'admin@erp.com' && password === 'admin123') {
        res.json({ 
            success: true, 
            user: { 
                name: 'Administrador ERP', 
                email: email, 
                role: 'admin',
                tier: 'platinum'
            }
        });
    } else {
        res.status(401).json({ success: false, msg: 'Credenciales inválidas' });
    }
});

// Datos Mock (Respaldo si PostgreSQL no está activo)
const mockProducts = [
  // --- MAQUINARIA Y HERRAMIENTAS ---
  {
    id: 1,
    sku: 'HPT-2001',
    title: 'Mezcladora de Concreto Profesional 1/2 Saco',
    description: 'Mezcladora de alto rendimiento para concreto y materiales densos. Ideal para construcción pesada. Motor de 1HP.',
    stock: 15,
    price_base: 8599.00,
    currency: 'MXN',
    category: 'Maquinaria',
    lead_score: 10,
    images: ['https://images.unsplash.com/photo-1615818968940-20dc9cb4ebf1?q=80&w=600&auto=format&fit=crop'],
    specs: { potencia: "1 HP", capacidad: "1/2 Saco", peso: "50kg" }
  },
  {
    id: 2,
    sku: 'TAL-X18V',
    title: 'Taladro Percutor Inalámbrico 18V Brushless',
    description: 'Taladro inalámbrico con batería de litio de larga duración. Motor sin escobillas para mayor rendimiento.',
    stock: 45,
    price_base: 3299.00,
    currency: 'MXN',
    category: 'Herramientas',
    lead_score: 5,
    images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=600&auto=format&fit=crop'],
    specs: { voltaje: "18V", bateria: "2x 2.0Ah", torque: "60Nm" }
  },
  {
    id: 3,
    sku: 'SIE-CIRC',
    title: 'Sierra Circular 7-1/4" 1500W',
    description: 'Sierra potente para cortes precisos en madera. Incluye disco de carburo de tungsteno.',
    stock: 8,
    price_base: 2150.00,
    currency: 'MXN',
    category: 'Herramientas',
    lead_score: 4,
    images: ['https://images.unsplash.com/photo-1540306385966-ba091b1ac9a4?q=80&w=600&auto=format&fit=crop'],
    specs: { potencia: "1500W", disco: '7-1/4"', rpm: "5500" }
  },
  
  // --- SEGURIDAD INDUSTRIAL ---
  {
    id: 4,
    sku: 'SEG-GUA5',
    title: 'Guantes de Seguridad Anticorte Nivel 5',
    description: 'Guantes resistentes a cortes nivel 5. Material transpirable con recubrimiento de nitrilo.',
    stock: 500,
    price_base: 189.00,
    currency: 'MXN',
    category: 'Seguridad',
    lead_score: 2,
    images: ['https://images.unsplash.com/photo-1583274211155-7ea1b5894103?q=80&w=600&auto=format&fit=crop'],
    specs: { talla: "L", material: "HPPE/Nitrilo", norma: "EN388" }
  },
  {
    id: 5,
    sku: 'SEG-CAS',
    title: 'Casco de Seguridad Industrial Clase E',
    description: 'Casco dieléctrico con suspensión de matraca de 4 puntos. Cumple normas ANSI.',
    stock: 120,
    price_base: 145.00,
    currency: 'MXN',
    category: 'Seguridad',
    lead_score: 1,
    images: ['https://images.unsplash.com/photo-1534062839848-0d1275988184?q=80&w=600&auto=format&fit=crop'],
    specs: { color: "Amarillo", clase: "E", suspension: "Matraca" }
  },
  {
    id: 6,
    sku: 'SEG-BOT',
    title: 'Botas de Seguridad Dielectrica c/Casquillo',
    description: 'Calzado industrial ligero, suela antiderrapante y casquillo de poliamida.',
    stock: 0,
    price_base: 899.00,
    currency: 'MXN',
    category: 'Seguridad',
    lead_score: 3,
    images: ['https://plus.unsplash.com/premium_photo-1664303358356-9da8379c1482?q=80&w=600&auto=format&fit=crop'],
    specs: { talla: "27 MX", corte: "Piel", casquillo: "Poliamida" }
  },

  // --- CONSTRUCCIÓN Y MATERIALES ---
  {
    id: 7,
    sku: 'MAT-CEM',
    title: 'Cemento Gris Portland 50kg',
    description: 'Cemento de alta resistencia para todo tipo de obras. Fraguado óptimo.',
    stock: 1000,
    price_base: 245.00,
    currency: 'MXN',
    category: 'Construcción',
    lead_score: 5,
    images: ['https://images.unsplash.com/photo-1627448378516-b183dd27ed26?q=80&w=600&auto=format&fit=crop'],
    specs: { peso: "50kg", tipo: "CPC 30R" }
  },
  {
    id: 8,
    sku: 'MAT-TAB',
    title: 'Panel de Yeso Estándar 1.22 x 2.44m',
    description: 'Tablaroca estándar para muros y plafones interiores. Supervisión ligera.',
    stock: 200,
    price_base: 165.00,
    currency: 'MXN',
    category: 'Construcción',
    lead_score: 2,
    images: ['https://images.unsplash.com/photo-1620171249964-67252277491d?q=80&w=600&auto=format&fit=crop'],
    specs: { espesor: "1/2 pulgada", medidas: "1.22x2.44m" }
  },

  // --- PINTURAS E IMPERMEABILIZANTES ---
  {
    id: 9,
    sku: 'PNT-VIN',
    title: 'Pintura Vinílica Blanca 19L Mate',
    description: 'Pintura lavable de alto poder cubriente. Ideal para interiores y exteriores techados.',
    stock: 40,
    price_base: 1250.00,
    currency: 'MXN',
    category: 'Pinturas',
    lead_score: 3,
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop'],
    specs: { contenido: "19 Litros", acabado: "Mate", garantia: "5 años" }
  },
  {
    id: 10,
    sku: 'PNT-IMP',
    title: 'Impermeabilizante Acrílico Rojo 5 Años 19L',
    description: 'Fibratado, no requiere malla de refuerzo. Aislante térmico.',
    stock: 25,
    price_base: 1690.00,
    currency: 'MXN',
    category: 'Pinturas',
    lead_score: 6,
    images: ['https://images.unsplash.com/photo-1605218427306-633ba810c71c?q=80&w=600&auto=format&fit=crop'],
    specs: { duracion: "5 Años", color: "Terracota", rendimiento: "19m2" }
  },

  // --- BAÑOS Y PLOMERÍA ---
  {
    id: 11,
    sku: 'PLO-WC',
    title: 'Sanitario One Piece Ecológico',
    description: 'Inodoro de una pieza, doble descarga para ahorro de agua. Diseño moderno.',
    stock: 12,
    price_base: 2890.00,
    currency: 'MXN',
    category: 'Baños',
    lead_score: 4,
    images: ['https://images.unsplash.com/photo-1564540586988-aa4e53c3d003?q=80&w=600&auto=format&fit=crop'],
    specs: { consumo: "3.8 Lpf", color: "Blanco", sistema: "Dual Flush" }
  },
  {
    id: 12,
    sku: 'PLO-GRIF',
    title: 'Mezcladora Monomando para Lavabo Cromo',
    description: 'Grifo monomando acabado cromo pulido. Cartucho cerámico de larga duración.',
    stock: 30,
    price_base: 850.00,
    currency: 'MXN',
    category: 'Baños',
    lead_score: 1,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'],
    specs: { material: "Latón", acabado: "Cromo", altura: "Baja" }
  },

  // --- ILUMINACIÓN Y ELÉCTRICO ---
  {
    id: 13,
    sku: 'ELEC-REF',
    title: 'Reflector LED Exterior 50W Luz Fría',
    description: 'Reflector de alta potencia IP65 resistente a la lluvia. Ideal para patios y obras.',
    stock: 60,
    price_base: 299.00,
    currency: 'MXN',
    category: 'Iluminación',
    lead_score: 2,
    images: ['https://images.unsplash.com/photo-1549419137-97d519391054?q=80&w=600&auto=format&fit=crop'],
    specs: { potencia: "50W", proteccion: "IP65", luz: "6500K" }
  },
  {
    id: 14,
    sku: 'ELEC-ROLLO',
    title: 'Cable THW Calibre 12 Rojo 100m',
    description: 'Cable conductor de cobre 100% puro. Aislamiento antiflama.',
    stock: 100,
    price_base: 1150.00,
    currency: 'MXN',
    category: 'Eléctrico',
    lead_score: 5,
    images: ['https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?q=80&w=600&auto=format&fit=crop'],
    specs: { calibre: "12 AWG", longitud: "100m", material: "Cobre" }
  },
  {
    id: 15,
    sku: 'ORG-EST',
    title: 'Estante Metálico 5 Repisas Uso Rudo',
    description: 'Estante organizador soporta hasta 50kg por repisa. Armado sin tornillos.',
    stock: 0,
    price_base: 950.00,
    currency: 'MXN',
    category: 'Organización',
    lead_score: 3,
    images: ['https://images.unsplash.com/photo-1595514020180-272e61239c48?q=80&w=600&auto=format&fit=crop'],
    specs: { medidas: "180x90x40cm", capacidad: "250kg Total" }
  }

];

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
