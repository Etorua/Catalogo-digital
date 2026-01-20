import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <h2 style={{ marginBottom: '1rem', color: '#333' }}>Tu carrito está vacío</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Parece que aún no has agregado productos a tu pedido.</p>
                <Link to="/" className="btn-primary" style={{ 
                    display: 'inline-block', 
                    background: '#f96302', 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                }}>
                    Ir a comprar
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>Carrito de Compras ({cart.length} productos)</h1>
            
            <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                
                {/* Product List */}
                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.id} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '100px 1fr auto', 
                            gap: '1.5rem', 
                            borderBottom: '1px solid #eee', 
                            padding: '1.5rem 0',
                            alignItems: 'start'
                        }}>
                            <div style={{ background: '#f4f4f4', padding: '0.5rem', borderRadius: '4px' }}>
                                <img src={item.images && item.images[0]} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                                    <Link to={`/product/${item.id}`} style={{ color: '#333', textDecoration: 'none' }}>{item.title}</Link>
                                </h3>
                                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>SKU: {item.sku}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ width: '30px', height: '30px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                    >-</button>
                                    <span style={{ width: '40px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ width: '30px', height: '30px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                    >+</button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                                    {formatCurrency(item.price_base * item.quantity)}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                    {formatCurrency(item.price_base)} c/u
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary / Sidebar */}
                <div className="cart-summary" style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '8px', height: 'fit-content' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Resumen del pedido</h2>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#666' }}>Subtotal</span>
                        <span style={{ fontWeight: 'bold' }}>{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#666' }}>Envío estimado</span>
                        <span style={{ color: '#166534', fontWeight: 'bold' }}>Gratis</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f96302' }}>{formatCurrency(getCartTotal())}</span>
                    </div>

                    <button 
                        onClick={() => alert('¡Función de pago en desarrollo! En un entorno real, esto iría a Stripe o generaría una cotización PDF.')}
                        style={{ 
                            width: '100%', 
                            background: '#f96302', 
                            color: 'white', 
                            padding: '1rem', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        Proceder al Pago
                    </button>
                    
                    <button 
                        onClick={clearCart}
                        style={{ 
                            width: '100%', 
                            background: 'white', 
                            color: '#666', 
                            padding: '0.8rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                        }}
                    >
                        Vaciar Carrito
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Cart;
