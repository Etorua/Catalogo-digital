import React from 'react';
import { Link } from 'react-router-dom';

function Footer({ onSubscribe }) {
    const handleSubscribe = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (email) {
            // alert(`Gracias por suscribirte con ${email}`);
            if (onSubscribe) onSubscribe('¡Gracias por suscribirte a nuestro boletín!', 'success');
            e.target.reset();
        }
    };

    return (
        <footer style={{ marginTop: '50px', borderTop: '1px solid #e5e7eb', color: '#4b5563', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
            
            {/* Newsletter Section */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '20px 0' }}>
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '18px' }}>Suscríbete a nuestro newsletter</h3>
                        <p style={{ margin: 0, fontSize: '13px' }}>¡Entérate de nuestras promociones antes que nadie, tips para comprar y mucho más!</p>
                    </div>
                    <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexGrow: 1, maxWidth: '600px' }}>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="correo@dominio.com" 
                            required
                            style={{ flexGrow: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                        <button 
                            type="submit" 
                            style={{ 
                                backgroundColor: 'white', 
                                color: '#f96302', 
                                border: '1px solid #f96302', 
                                padding: '10px 20px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            ✉ Suscribirme ahora
                        </button>
                    </form>
                </div>
            </div>

            {/* Slogan & Contact Info */}
            <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div className="container" style={{ padding: '20px 1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                    <div style={{ fontSize: '18px', color: '#6b7280' }}>
                        Suministrando el futuro <span style={{fontSize: '12px', verticalAlign: 'top'}}>®</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '12px' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{color: '#f96302', fontSize: '18px'}}>📞</span>
                            <div>
                                <div style={{fontWeight: 'bold'}}>Llámanos</div>
                                <div style={{color: '#f96302'}}>800 PRO CENTER</div>
                            </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{color: '#f96302', fontSize: '18px'}}>💬</span>
                            <div>
                                <div style={{fontWeight: 'bold'}}>Whatsapp</div>
                                <div style={{color: '#f96302'}}>+52 55 0000 0000</div>
                            </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{color: '#f96302', fontSize: '18px'}}>✉</span>
                            <div>
                                <div style={{fontWeight: 'bold'}}>Escríbenos</div>
                                <div style={{color: '#f96302'}}>contacto@procenter.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links Columns */}
            <div className="container" style={{ padding: '40px 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                <div>
                    <h4 style={{ color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>The Pro Center México</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
                        <li><Link to="/info/quienes-somos" style={{ textDecoration: 'none', color: '#687fa1' }}>Iconos y Empresa</Link></li>
                        <li><Link to="/news" style={{ textDecoration: 'none', color: '#687fa1' }}>Noticias y Responsabilidad social</Link></li>
                        <li><Link to="/suppliers" style={{ textDecoration: 'none', color: '#687fa1' }}>Quiero ser proveedor</Link></li>
                        <li><Link to="/careers" style={{ textDecoration: 'none', color: '#687fa1' }}>Haz carrera con nosotros</Link></li>
                        <li><Link to="/stores" style={{ textDecoration: 'none', color: '#687fa1' }}>Buscador de tiendas</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>¿Cómo Podemos Ayudarte?</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
                        <li><Link to="/info/faq" style={{ textDecoration: 'none', color: '#687fa1' }}>Ayuda y preguntas frecuentes</Link></li>
                        <li><Link to="/info/facturacion" style={{ textDecoration: 'none', color: '#687fa1' }}>Facturación electrónica</Link></li>
                        <li><Link to="/info/contacto" style={{ textDecoration: 'none', color: '#687fa1' }}>Contáctanos</Link></li>
                        <li><Link to="/services" style={{ textDecoration: 'none', color: '#687fa1' }}>Nuestros Servicios</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>Legales</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
                        <li><Link to="/terms" style={{ textDecoration: 'none', color: '#687fa1' }}>Términos y condiciones</Link></li>
                        <li><Link to="/info/envios-devoluciones" style={{ textDecoration: 'none', color: '#687fa1' }}>Política de devoluciones</Link></li>
                        <li><Link to="/privacy" style={{ textDecoration: 'none', color: '#687fa1' }}>Aviso de privacidad</Link></li>
                        <li><Link to="/info/garantia" style={{ textDecoration: 'none', color: '#687fa1' }}>Centro de Garantías</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>Sitios recomendados</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
                        <li><Link to="/blog" style={{ textDecoration: 'none', color: '#687fa1' }}>Blog Pro Center</Link></li>
                        <li><Link to="/club" style={{ textDecoration: 'none', color: '#687fa1' }}>Club de Profesionales</Link></li>
                        <li><Link to="/usa" style={{ textDecoration: 'none', color: '#687fa1' }}>The Pro Center USA</Link></li>
                    </ul>
                </div>
            </div>

            {/* Socials & Copyright */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '20px 0', borderTop: '1px solid #e5e7eb' }}>
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Conecta con nosotros</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           {/* Social Icons Placeholders */}
                           <div style={{width: '24px', height: '24px', background: '#f96302', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold'}}>f</div>
                           <div style={{width: '24px', height: '24px', background: '#f96302', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold'}}>X</div>
                           <div style={{width: '24px', height: '24px', background: '#f96302', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold'}}>in</div>
                           <div style={{width: '24px', height: '24px', background: '#f96302', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold'}}>IG</div>
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '11px', color: '#9ca3af', maxWidth: '600px', textAlign: 'right' }}>
                        © 2026 The Pro Center Inc. Todos los derechos reservados. Aviso de privacidad. Políticas de devolución. El uso de este sitio está sujeto a ciertos términos de uso que requieren un acuerdo legal.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
