import React from 'react';
import { Link } from 'react-router-dom';

function Promotions() {
    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '1rem', color: '#f96302' }}>Promociones Actuales</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>Aprovecha nuestros descuentos de temporada en una selección exclusiva de productos.</p>
            
            <div style={{ background: '#333', color: '#fff', padding: '2rem', borderRadius: '8px', marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>GRAN LIQUIDACIÓN</h2>
                <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Hasta 40% de descuento en Pinturas e Impermeabilizantes</p>
                <Link to="/?category=Pinturas" style={{ background: '#f96302', color: '#fff', padding: '1rem 2rem', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    VER OFERTAS
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                 <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ background: 'red', color: 'white', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>-20%</div>
                    <h3>Kit de Instalación Eléctrica</h3>
                    <p>Todo lo que necesitas para renovar tu hogar.</p>
                    <Link to="/product/14" style={{ color: '#f96302', fontWeight: 'bold', textDecoration: 'none' }}>Ver producto</Link>
                 </div>
                 <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ background: 'red', color: 'white', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>-15%</div>
                    <h3>Pack de Seguridad Industrial</h3>
                    <p>Casco, guantes y botas con descuento especial.</p>
                    <Link to="/?category=Seguridad" style={{ color: '#f96302', fontWeight: 'bold', textDecoration: 'none' }}>Ver productos</Link>
                 </div>
            </div>
        </div>
    );
}

export default Promotions;
