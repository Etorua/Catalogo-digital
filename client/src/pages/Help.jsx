import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Help() {
    const [activeSlug, setActiveSlug] = useState('help-faq');
    const [pageContent, setPageContent] = useState(null);
    const [loading, setLoading] = useState(false);

    const pagesMap = [
        { title: 'Preguntas Frecuentes', slug: 'help-faq' },
        { title: 'Envíos y Devoluciones', slug: 'help-shipping' },
        { title: 'Facturación', slug: 'help-billing' },
        { title: 'Garantías', slug: 'help-warranty' },
        { title: 'Contacto', slug: 'help-contact' }
    ];

    // Contenido de respaldo (Fallback) en caso de que aún no existan las páginas en DB
    const fallbackContent = {
        'help-faq': {
            title: 'Preguntas Frecuentes',
            content: `
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
        'help-shipping': {
            title: 'Envíos y Devoluciones',
            content: `
                <h3>Política de Envíos</h3>
                <p>Realizamos envíos a toda la república. Los pedidos confirmados antes de la 1:00 PM salen el mismo día.</p>
                <h3>Devoluciones</h3>
                <p>Aceptamos devoluciones dentro de los primeros 15 días naturales, siempre y cuando el producto esté en su empaque original.</p>
            `
        },
        'help-billing': {
            title: 'Facturación',
            content: '<p>Para solicitar tu factura, envía tus datos fiscales a facturacion@empresa.com junto con tu número de pedido o usa nuestro portal de autofacturación (próximamente).</p>'
        },
        'help-warranty': {
            title: 'Garantías',
            content: '<p>Nuestros productos cuentan con garantía de fabricante contra defectos de fábrica. El periodo varía según la marca y producto.</p>'
        },
        'help-contact': {
            title: 'Contacto',
            content: '<p><strong>Teléfono:</strong> 800-000-0000<br><strong>Email:</strong> contacto@empresa.com<br><strong>Horario:</strong> Lunes a Viernes 9am - 7pm</p>'
        }
    };

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                // Intentar obtener del backend (CMS)
                const res = await axios.get(`/api/pages/${activeSlug}`);
                if (res.data && res.data.content) {
                    setPageContent(res.data);
                } else {
                    // Si la API responde pero sin contenido esperado
                    setPageContent(fallbackContent[activeSlug]);
                }
            } catch (err) {
                // Si falla (404 no encontrada o error de conexión), usar fallback
                console.warn(`Usando contenido local para ${activeSlug} (CMS no disponible o página no creada).`);
                setPageContent(fallbackContent[activeSlug]);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [activeSlug]);

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Centro de Ayuda</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px) 1fr', gap: '2rem' }}>
                
                {/* Menú Lateral */}
                <div style={{ background: '#f5f5f5', padding: '1rem', height: 'fit-content', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0 }}>Temas</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {pagesMap.map(page => (
                            <li 
                                key={page.slug}
                                onClick={() => setActiveSlug(page.slug)}
                                style={{ 
                                    padding: '0.75rem 0.5rem', 
                                    borderBottom: '1px solid #ddd', 
                                    cursor: 'pointer', 
                                    color: activeSlug === page.slug ? '#f96302' : '#333',
                                    background: activeSlug === page.slug ? 'white' : 'transparent',
                                    fontWeight: activeSlug === page.slug ? '600' : 'normal',
                                    borderLeft: activeSlug === page.slug ? '4px solid #f96302' : '4px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {page.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contenido Principal */}
                <div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Cargando información...</div>
                    ) : (
                        pageContent && (
                            <div className="help-content">
                                <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                    {pageContent.title}
                                </h2>
                                <div 
                                    dangerouslySetInnerHTML={{ __html: pageContent.content }} 
                                    style={{ lineHeight: '1.6', color: '#444' }}
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Help;
