import React, { useState } from 'react';

function ProSales() {
    const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Gracias por tu interés. Un asesor profesional te contactará pronto.');
        // In a real app, this would use the notification system or API
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: '#333' }}>Ventas a Profesionales</h1>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>
                    Obtén precios de mayoreo, crédito empresarial y atención personalizada para tus proyectos de construcción.
                </p>
            </div>

            <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#f96302' }}>Solicita tu cuenta PRO</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre Completo</label>
                        <input type="text" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Empresa / Razón Social</label>
                        <input type="text" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Correo Electrónico</label>
                            <input type="email" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Teléfono</label>
                            <input type="tel" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                        </div>
                    </div>
                    <button type="submit" style={{ background: '#f96302', color: 'white', border: 'none', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
                        Solicitar Información
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
                <div>
                   <h3 style={{ color: '#333' }}>🛒 Precios de Volumen</h3>
                   <p>Descuentos exclusivos por compra en volumen.</p>
                </div>
                <div>
                   <h3 style={{ color: '#333' }}>💳 Crédito Empresarial</h3>
                   <p>Plazos de pago de 30, 60 y 90 días.</p>
                </div>
                <div>
                   <h3 style={{ color: '#333' }}>🚛 Envíos Preferenciales</h3>
                   <p>Logística prioritaria para tus obras.</p>
                </div>
            </div>
        </div>
    );
}

export default ProSales;
