require('dotenv').config();
const { pool } = require('./db');

const initialPages = [
    {
        slug: 'help-faq',
        title: 'Preguntas Frecuentes',
        content: `
<h2>Preguntas Frecuentes</h2>
<div style="margin-bottom: 2rem;">
    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">¿Cómo puedo rastrear mi pedido?</h3>
    <p style="color: #666;">Puedes rastrear tu pedido desde la sección "Mis Compras" en tu perfil, o utilizando el número de guía enviado a tu correo.</p>
</div>
<div style="margin-bottom: 2rem;">
    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">¿Hacen envíos a todo el país?</h3>
    <p style="color: #666;">Sí, realizamos envíos a toda la República Mexicana. El tiempo de entrega varía según la zona.</p>
</div>
<div style="margin-bottom: 2rem;">
    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">¿Cómo solicito mi factura?</h3>
    <p style="color: #666;">Al finalizar tu compra, selecciona la opción "Requiero Factura" e ingresa tus datos fiscales. Te llegará en un lapso de 24 horas.</p>
</div>
<div style="background: #eef; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccf;">
    <h3 style="margin-top: 0;">¿Necesitas más ayuda?</h3>
    <p>Llámanos al <strong>800-000-0000</strong> o escríbenos a <strong>contacto@theprocenter.com</strong></p>
</div>`
    },
    {
        slug: 'help-shipping',
        title: 'Envíos y Devoluciones',
        content: `
<h2>Envíos y Devoluciones</h2>
<p>Información detallada sobre nuestra política de envíos y proceso de devoluciones.</p>
<h3>Tiempos de Entrega</h3>
<p>Nuestros tiempos de entrega estándar son de 3 a 5 días hábiles.</p>
<h3>Política de Devolución</h3>
<p>Aceptamos devoluciones dentro de los primeros 30 días posteriores a su compra, siempre y cuando el producto esté en su empaque original.</p>`
    },
    {
        slug: 'help-billing',
        title: 'Facturación',
        content: `
<h2>Información de Facturación</h2>
<p>Para solicitar tu factura, ten a la mano tu número de pedido y ticket de compra.</p>
<p>Recuerda que tienes hasta el final del mes en curso para solicitar tu factura.</p>`
    },
    {
        slug: 'help-warranty',
        title: 'Garantías',
        content: `
<h2>Garantías</h2>
<p>Todos nuestros productos cuentan con garantía directa de fabricante.</p>
<p>Si tienes algún problema con tu producto, contáctanos para asesorarte en el proceso de garantía.</p>`
    },
    {
        slug: 'help-contact',
        title: 'Contacto',
        content: `
<h2>Contáctanos</h2>
<p>Estamos aquí para ayudarte.</p>
<ul>
    <li>Teléfono: 800-000-0000</li>
    <li>Email: contacto@theprocenter.com</li>
    <li>Horario de atención: Lunes a Viernes de 9:00 AM a 6:00 PM</li>
</ul>`
    }
];

async function seedPages() {
    try {
        console.log('Iniciando carga de páginas de ayuda...');
        
        for (const page of initialPages) {
            // Verificar si existe
            const check = await pool.query('SELECT * FROM static_pages WHERE slug = $1', [page.slug]);
            
            if (check.rows.length === 0) {
                await pool.query(
                    'INSERT INTO static_pages (slug, title, content) VALUES ($1, $2, $3)',
                    [page.slug, page.title, page.content]
                );
                console.log(`Creada página: ${page.title}`);
            } else {
                console.log(`La página ya existe: ${page.title}`);
            }
        }
        
        console.log('Proceso finalizado correctamente.');
    } catch (err) {
        console.error('Error al cargar páginas:', err);
    } finally {
        // No cerramos el pool porque puede que lo use la app, pero al ser un script suelto
        // node terminará cuando el event loop se vacíe si cerramos.
        // En este contexto de ejecución script, mejor cerrar.
        await pool.end();
    }
}

seedPages();
