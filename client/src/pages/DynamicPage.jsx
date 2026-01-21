import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios.get(`/api/pages/${slug}`)
            .then(res => {
                setPage(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("No pudimos cargar la información solicitada.");
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div className="container" style={{padding: '50px', textAlign: 'center'}}>Cargando...</div>;
    
    if (error) return (
        <div className="container" style={{padding: '50px', textAlign: 'center'}}>
            <h2>Ups!</h2>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="container" style={{padding: '40px 20px', backgroundColor: 'white', marginTop: '20px', borderRadius: '8px', minHeight: '60vh'}}>
            {/* Renderizar HTML seguro */}
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
    );
};

export default DynamicPage;
