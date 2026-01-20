import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
    { name: 'Maquinaria', img: 'https://images.unsplash.com/photo-1574689049743-1dbe9a68bc44?auto=format&fit=crop&w=600&q=80' },
    { name: 'Herramientas', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Seguridad', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
    { name: 'Construcción', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { name: 'Pinturas', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80' },
    { name: 'Baños', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    { name: 'Iluminación', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=600&q=80' },
    { name: 'Eléctrico', img: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?auto=format&fit=crop&w=600&q=80' },
    { name: 'Organización', img: 'https://images.unsplash.com/photo-1595514020180-272e61239c48?auto=format&fit=crop&w=600&q=80' }
];

function Departments() {
    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem', color: '#333' }}>Departamentos</h1>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {categories.map((cat, index) => (
                    <Link to={`/?category=${cat.name}`} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <img 
                                src={cat.img} 
                                alt={cat.name} 
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '1rem', background: '#fff' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{cat.name}</h3>
                                <span style={{ color: '#f96302', fontWeight: 'bold', fontSize: '0.9rem' }}>Ver productos &rarr;</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Departments;
