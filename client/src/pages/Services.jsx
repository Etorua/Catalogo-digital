import React from 'react';

function Services() {
    const services = [
        { title: 'Instalación', desc: 'Contamos con expertos para la instalación de pisos, baños, cocinas y puertas.', icon: '🔧' },
        { title: 'Corte de Materiales', desc: 'Servicio de corte a medida para madera, tablaroca y perfiles.', icon: '✂️' },
        { title: 'Renta de Herramienta', desc: 'Renta la maquinaria que necesitas por día o por semana.', icon: '🚜' },
        { title: 'Diseño de Interiores', desc: 'Asesoría profesional para renovar tus espacios.', icon: '🎨' },
        { title: 'Entrega a Domicilio', desc: 'Llevamos tus materiales hasta la puerta de tu obra.', icon: '🚚' },
        { title: 'Igualación de Color', desc: 'Trae tu muestra y preparamos el tono exacto de pintura.', icon: '🖌️' }
    ];

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Nuestros Servicios</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {services.map((s, i) => (
                    <div key={i} style={{ border: '1px solid #eee', padding: '2rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
                        <h3 style={{ color: '#333', marginBottom: '1rem' }}>{s.title}</h3>
                        <p style={{ color: '#666' }}>{s.desc}</p>
                        <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', border: '1px solid #f96302', background: 'transparent', color: '#f96302', borderRadius: '4px', cursor: 'pointer' }}>Más información</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Services;
