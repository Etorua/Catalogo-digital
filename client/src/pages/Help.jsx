import React from 'react';

function Help() {
    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Centro de Ayuda</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                <div style={{ background: '#f5f5f5', padding: '1rem' }}>
                    <h3>Temas</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd', cursor: 'pointer', color: '#f96302' }}>Preguntas Frecuentes</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd', cursor: 'pointer' }}>Envíos y Devoluciones</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd', cursor: 'pointer' }}>Facturación</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd', cursor: 'pointer' }}>Garantías</li>
                        <li style={{ padding: '0.5rem 0', cursor: 'pointer' }}>Contacto</li>
                    </ul>
                </div>
                <div>
                    <h2>Preguntas Frecuentes</h2>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿Cómo puedo rastrear mi pedido?</h3>
                        <p style={{ color: '#666' }}>Puedes rastrear tu pedido desde la sección "Mis Compras" en tu perfil, o utilizando el número de guía enviado a tu correo.</p>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿Hacen envíos a todo el país?</h3>
                        <p style={{ color: '#666' }}>Sí, realizamos envíos a toda la República Mexicana. El tiempo de entrega varía según la zona.</p>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿Cómo solicito mi factura?</h3>
                        <p style={{ color: '#666' }}>Al finalizar tu compra, selecciona la opción "Requiero Factura" e ingresa tus datos fiscales. Te llegará en un lapso de 24 horas.</p>
                    </div>
                    
                    <div style={{ background: '#eef', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ccf' }}>
                        <h3 style={{ marginTop: 0 }}>¿Necesitas más ayuda?</h3>
                        <p>Llámanos al <strong>800-000-0000</strong> o escríbenos a <strong>contacto@theprocenter.com</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Help;
