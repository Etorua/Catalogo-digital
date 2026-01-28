import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Promotions() {
    const [banner, setBanner] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannerRes, promosRes] = await Promise.all([
                    axios.get('/api/marketing/promo_main_banner').catch(() => ({ data: null })), // If banner doesn't exist yet, standard fallback
                    axios.get('/api/promotions').catch(() => ({ data: [] }))
                ]);

                if (bannerRes.data) setBanner(bannerRes.data);
                if (promosRes.data) setPromotions(promosRes.data);
            } catch (error) {
                console.error("Error loading promotions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="container" style={{padding:'2rem'}}>Cargando ofertas...</div>;

    const mainBanner = banner || {
        title: 'GRAN LIQUIDACIÓN',
        content: 'Hasta 40% de descuento en Pinturas e Impermeabilizantes',
        target_link: '/?category=Pinturas'
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '1rem', color: '#f96302' }}>Promociones Actuales</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>Aprovecha nuestros descuentos de temporada en una selección exclusiva de productos.</p>
            
            {/* Main Banner Dynamic */}
            <div style={{ background: '#1e293b', color: '#fff', padding: '3rem 2rem', borderRadius: '12px', marginBottom: '3rem', textAlign: 'center', backgroundImage: mainBanner.image_url ? `url(${mainBanner.image_url})` : 'none', backgroundSize:'cover', backgroundPosition:'center' }}>
                <div style={{ background: mainBanner.image_url ? 'rgba(0,0,0,0.6)' : 'transparent', padding: '1rem', borderRadius:'8px', display:'inline-block' }}>
                    <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight:'900' }}>{mainBanner.title}</h2>
                    <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{mainBanner.content && mainBanner.content.replace ? mainBanner.content.replace(/"/g, '') : mainBanner.content}</p>
                    {mainBanner.target_link && (
                        <Link to={mainBanner.target_link} style={{ background: '#f96302', color: '#fff', padding: '1rem 2rem', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            VER OFERTAS
                        </Link>
                    )}
                </div>
            </div>

            {/* Promos Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                 {promotions.length > 0 ? promotions.map(promo => (
                     <div key={promo.id} style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '12px', background: 'white', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ 
                            background: promo.badge_color || 'red', 
                            color: 'white', 
                            display: 'inline-block', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            marginBottom: '1rem', 
                            fontWeight: 'bold', 
                            fontSize: '0.9rem'
                        }}>
                            {promo.badge_text}
                        </div>
                        <h3 style={{marginTop:0, fontSize: '1.25rem'}}>{promo.title}</h3>
                        <p style={{color: '#64748b', lineHeight: 1.5}}>{promo.description}</p>
                        {promo.target_link && (
                            <Link to={promo.target_link} style={{ color: '#f96302', fontWeight: 'bold', textDecoration: 'none', display:'flex', alignItems:'center', gap:'5px', marginTop: '1rem' }}>
                                Ver productos <span>→</span>
                            </Link>
                        )}
                     </div>
                 )) : (
                     <p style={{color: '#666'}}>No hay promociones adiconales en este momento.</p>
                 )}
            </div>
        </div>
    );
}

export default Promotions;
