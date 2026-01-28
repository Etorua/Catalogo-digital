import React from 'react';

export const PosTicket = ({ order, componentRef }) => {
    // Always render the container div for Ref stability to prevent "NotFoundError" in React
    // If no order, we just render an empty div with the ref, but hidden.
    if (!order) {
        return <div style={{display:'none'}}><div ref={componentRef}></div></div>;
    }

    return (
        <div style={{ display: 'none' }}>
            <div ref={componentRef} style={{ width: '80mm', padding: '5px', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', color: 'black', background: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>FERRETERIA PLUS</h2>
                    <div style={{fontSize:'10px'}}>RFC: XAXX010101000</div>
                    <div style={{fontSize:'10px'}}>Av. Principal #123, Col. Centro</div>
                    <div style={{fontSize:'10px'}}>Ciudad de México, CP 00000</div>
                    <div style={{fontSize:'10px'}}>Tel: (55) 1234-5678</div>
                </div>

                <div style={{ borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '5px 0', margin: '5px 0', fontSize: '10px' }}>
                    <div>Folio: {order.id}</div>
                    <div>Fecha: {new Date(order.date || Date.now()).toLocaleString()}</div>
                    <div>Cliente: {order.customer_name || 'Mostrador'}</div>
                    {order.payment_method && <div>Pago: {order.payment_method}</div>}
                </div>

                <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{borderBottom:'1px solid black'}}>
                            <th style={{ textAlign: 'left', width: '10%' }}>Cant</th>
                            <th style={{ textAlign: 'left', width: '60%' }}>Desc</th>
                            <th style={{ textAlign: 'right', width: '30%' }}>Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, i) => (
                            <tr key={i}>
                                <td style={{ verticalAlign: 'top', paddingRight: '2px' }}>{item.quantity}</td>
                                <td style={{ verticalAlign: 'top', whiteSpace: 'normal' }}>{item.title}</td>
                                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ borderTop: '1px dashed black', marginTop: '10px', paddingTop: '5px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                    TOTAL: ${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total).toFixed(2)}
                </div>
                
                <div style={{ marginTop: '5px', textAlign: 'right', fontSize: '10px' }}>
                    {order.items.length} Artículos
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px' }}>
                    <p>¡Gracias por su compra!</p>
                    <p>Este no es un comprobante fiscal.</p>
                </div>
            </div>
        </div>
    );
};
