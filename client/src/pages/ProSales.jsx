import React, { useState } from 'react';
import axios from 'axios';

function ProSales() {
    const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '' });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const res = await axios.post('/api/contact/pro-request', formData);
            if (res.data.success) {
                setStatus('success');
                setFormData({ name: '', company: '', email: '', phone: '' });
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
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
                
                {status === 'success' && (
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>
                        ✅ ¡Solicitud enviada! Un asesor te contactará en breve.
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre Completo</label>
                        <input name="name" value={formData.name} onChange={handleChange} type="text" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Empresa / Razón Social</label>
                        <input name="company" value={formData.company} onChange={handleChange} type="text" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Correo Electrónico</label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Teléfono</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} type="tel" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} required />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        style={{ 
                            background: status === 'loading' ? '#ccc' : '#f96302', 
                            color: 'white', border: 'none', padding: '1rem', 
                            fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '4px', 
                            cursor: status === 'loading' ? 'not-allowed' : 'pointer', 
                            marginTop: '1rem' 
                        }}
                    >
                        {status === 'loading' ? 'Enviando...' : 'Solicitar Información'}
                    </button>
                    {status === 'error' && <p style={{color: 'red', marginTop: '10px'}}>Hubo un error al enviar tu solicitud. Intenta de nuevo.</p>}
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
