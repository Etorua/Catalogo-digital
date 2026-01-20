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
    
    // Construcción dinámica de la query (Simulación)
    let filtered = [...mockProducts];
    
    // Filtro por Texto (Buscador)
    if (search) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(search.toLowerCase()) || 
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Filtro por Categoría
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    // Filtro por Precio Minimo
    if (minPrice) {
        filtered = filtered.filter(p => p.price_base >= parseFloat(minPrice));
    }

    // Filtro por Precio Maximo
    if (maxPrice) {
        filtered = filtered.filter(p => p.price_base <= parseFloat(maxPrice));
    }

    // Filtro por Stock (Solo disponibles)
    if (inStock === 'true') {
        filtered = filtered.filter(p => p.stock > 0);
    }

    // Ordenamiento
    if (sort) {
        switch(sort) {
            case 'price_asc':
                filtered.sort((a, b) => a.price_base - b.price_base);
                break;
            case 'price_desc':
                filtered.sort((a, b) => b.price_base - a.price_base);
                break;
            case 'name_asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                break;
        }
    }

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    res.json({
        data: paginatedItems,
        pagination: {
            total: filtered.length,
            currentPage: pageNum,
            totalPages: Math.ceil(filtered.length / limitNum),
            limit: limitNum
        }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 1.1 Obtener Categorías Disponibles
app.get('/api/categories', (req, res) => {
    const categories = mockProducts.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});
    
    // Retorna array: [{ name: 'Maquinaria', count: 5 }, ...]
    const categoryList = Object.entries(categories).map(([name, count]) => ({ name, count }));
    res.json(categoryList);
});

// 2. Ficha de Producto Detallada (API)
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        
        // Mock Implementation
        const product = mockProducts.find(p => p.id == id || p.sku == id);
        
        if (product) {
            // Simular log de "Lead Score" en CRM al ver detalle
            console.log(`[CRM] Lead Score +1 for product ${product.sku}`);
            res.json(product);
        } else {
            res.status(404).json({ msg: "Producto no encontrado" });
        }
    } catch (err) {
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
