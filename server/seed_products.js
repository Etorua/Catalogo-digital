const { pool } = require('./db');

const categories = [
  'Materiales de Construcción',
  'Herramientas Eléctricas',
  'Herramientas Manuales',
  'Plomería',
  'Electricidad',
  'Pinturas y Acabados',
  'Seguridad Industrial',
  'Jardinería',
  'Ferretería General',
  'Pisos y Azulejos'
];

const productTypes = {
  'Materiales de Construcción': ['Cemento', 'Varilla', 'Arena', 'Grava', 'Yeso', 'Cal', 'Ladrillo', 'Block', 'Adhesivo', 'Impermeabilizante'],
  'Herramientas Eléctricas': ['Taladro', 'Sierra Circular', 'Esmeriladora', 'Lijadora', 'Rotomartillo', 'Atornillador', 'Sierra Caladora', 'Compresor', 'Soldadora', 'Generador'],
  'Herramientas Manuales': ['Martillo', 'Destornillador', 'Llave Inglesa', 'Pinzas', 'Serrucho', 'Flexómetro', 'Nivel', 'Cincel', 'Llave Allen', 'Cutter'],
  'Plomería': ['Tubo PVC', 'Codo', 'Tee', 'Llave de Paso', 'Regadera', 'Mezcladora', 'Cinta Teflón', 'Bomba de Agua', 'Flotador', 'Coladera'],
  'Electricidad': ['Cable Calibre 12', 'Apagador', 'Contacto Duplex', 'Foco LED', 'Multímetro', 'Cinta de Aislar', 'Pastilla Termomagnética', 'Socket', 'Extension', 'Canaleta'],
  'Pinturas y Acabados': ['Pintura Vinílica', 'Brocha', 'Rodillo', 'Sellador', 'Thinner', 'Barniz', 'Esmalte', 'Charola', 'Espátula', 'Lija'],
  'Seguridad Industrial': ['Casco', 'Chaleco', 'Lentes', 'Tapones Auditivos', 'Botas', 'Arnés', 'Mascarilla', 'Guantes', 'Impermeable', 'Faja'],
  'Jardinería': ['Pala', 'Rastrillo', 'Manguera', 'Podadora', 'Machete', 'Aspersor', 'Tijeras de Poda', 'Hacha', 'Carretilla', 'Maceta'],
  'Ferretería General': ['Tornillos', 'Clavos', 'Tuercas', 'Rondanas', 'Taquetes', 'Pijas', 'Armellas', 'Bisagras', 'Candado', 'Cadena'],
  'Pisos y Azulejos': ['Azulejo Blanco', 'Piso Cerámico', 'Boquilla', 'Separadores', 'Cortadora de Azulejo', 'Zoclo', 'Silicona', 'Limpiador', 'Malla', 'Ceneefa']
};

async function seedProducts() {
  console.log('🌱 Iniciando sembrado de productos...');
  
  try {
    // Limpiar productos existentes (opcional, para demo)
    // await pool.query('TRUNCATE products CASCADE'); 

    const products = [];
    let skuCounter = 100;

    for (const [category, types] of Object.entries(productTypes)) {
      for (const type of types) {
        skuCounter++;
        const sku = `SKU${skuCounter}`;
        const title = `${type} Profesional ${['Pro', 'Max', 'Ultra', 'Plus'][Math.floor(Math.random() * 4)]}`;
        const description = `Producto de alta calidad para trabajos de ${category.toLowerCase()}. Ideal para uso profesional y doméstico. Garantía de durabilidad.`;
        const stock = Math.floor(Math.random() * 500) + 10; // 10 a 510
        const price = (Math.random() * 2000 + 50).toFixed(2); // 50 a 2050
        const leadScore = Math.floor(Math.random() * 10) + 1;
        
        // Imagen placeholder genérica por categoría
        const image = `https://placehold.co/400x400?text=${encodeURIComponent(type)}`;

        products.push({
          sku,
          title,
          description,
          stock,
          price_base: price,
          category,
          lead_score: leadScore,
          images: [image],
          specs: JSON.stringify({
            marca: ['Truper', 'Cemex', 'Rotoplas', 'Phillips', '3M', 'DeWalt'][Math.floor(Math.random() * 6)],
            modelo: `MOD-${Math.floor(Math.random() * 1000)}`,
            peso: `${(Math.random() * 10).toFixed(1)} kg`
          })
        });
      }
    }

    // Insertar en la base de datos
    for (const p of products) {
        const query = `
            INSERT INTO products (sku, title, description, stock, price_base, category, lead_score, images, specs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (sku) DO NOTHING;
        `;
        const values = [p.sku, p.title, p.description, p.stock, p.price_base, p.category, p.lead_score, p.images, p.specs];
        await pool.query(query, values);
        process.stdout.write('.');
    }

    console.log(`\n✅ Se han insertado/verificado ${products.length} productos.`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error al sembrar productos:', err);
    process.exit(1);
  }
}

seedProducts();
