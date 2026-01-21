import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'cms'
    
    // --- Product Logic ---
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        sku: '', title: '', price_base: '', stock: '', category: 'General', description: '', image: ''
    });

    // --- CMS Logic ---
    const [pages, setPages] = useState([]);
    const [editingPage, setEditingPage] = useState(null);
    const [cmsFormData, setCmsFormData] = useState({ slug: '', title: '', content: '' });

    useEffect(() => {
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'cms') fetchPages();
    }, [activeTab]);

    const fetchProducts = () => {
        axios.get('/api/products?limit=100').then(res => {
            if (res.data.data && Array.isArray(res.data.data)) {
                setProducts(res.data.data);
            } else {
                setProducts(res.data);
            }
        });
    };

    const fetchPages = () => {
        axios.get('/api/pages').then(res => setPages(res.data)).catch(console.error);
    };

    const handleCmsEdit = (pageSlug) => {
        axios.get(`/api/pages/${pageSlug}`).then(res => {
            setEditingPage(res.data);
            setCmsFormData(res.data);
        });
    };

    const handleCmsSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/pages/${cmsFormData.slug}`, cmsFormData);
            alert('Página guardada correctamente');
            setEditingPage(null);
            fetchPages();
        } catch (err) {
            alert('Error al guardar página');
        }
    };

    const handleCreateCms = () => {
        setEditingPage({ isNew: true });
        setCmsFormData({ slug: '', title: '', content: '' });
    }

    // --- Product Handlers ---
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            await axios.delete(`/api/products/${id}`);
            fetchProducts();
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        const img = Array.isArray(product.images) ? product.images[0] : product.images;
        setFormData({ ...product, image: img });
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setFormData({ sku: '', title: '', price_base: '', stock: '', category: 'General', description: '', image: '' });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, images: [formData.image || 'https://placehold.co/600x400'] };
            
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id}`, payload);
            } else {
                await axios.post('/api/products', { ...payload, lead_score: 5, currency: 'USD' });
            }
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            alert('Error al guardar');
        }
    };

    // Derived State for Stats
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock < 10).length;
    const inventoryValue = products.reduce((acc, p) => acc + (p.price_base * p.stock), 0);
    
    // Filtered Products
    const filteredProducts = products.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || user.role !== 'admin') {
        return <div style={{textAlign: 'center', marginTop: '50px', padding: '20px'}}>
            <h2>Acceso Restringido</h2>
            <p>Necesitas permisos de administrador para ver esta página.</p>
            <a href="/login" className="primary-btn" style={{textDecoration:'none', display:'inline-block', marginTop:'10px'}}>Iniciar Sesión</a>
        </div>;
    }

    return (
        <div className="product-details-container" style={{ padding: '20px', maxWidth: '100%', background: '#f4f4f5' }}>
            
            {/* Header & Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#333'}}>Panel de Administración</h1>
                <div style={{display:'flex', gap:'10px'}}>
                    <button 
                        onClick={() => setActiveTab('products')} 
                        className={activeTab === 'products' ? 'primary-btn' : 'secondary-btn'}
                    >
                        📦 Productos
                    </button>
                    <button 
                        onClick={() => setActiveTab('cms')} 
                        className={activeTab === 'cms' ? 'primary-btn' : 'secondary-btn'}
                    >
                        📄 Contenidos (CMS)
                    </button>
                </div>
            </div>

            {/* --- CMS VIEW --- */}
            {activeTab === 'cms' && (
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                        <h2>Gestor de Páginas Informativas</h2>
                        <button className="primary-btn" onClick={handleCreateCms}>+ Nueva Página</button>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start'}}>
                        {/* Lista de Paginas */}
                        <div style={{background: '#f9f9f9', padding: '10px', borderRadius: '4px'}}>
                            <h3 style={{fontSize:'14px', marginBottom:'10px', textTransform:'uppercase', color:'#666'}}>Páginas Disponibles</h3>
                            <ul style={{listStyle:'none', padding:0, margin:0}}>
                                {pages.map(p => (
                                    <li key={p.slug} style={{marginBottom:'5px'}}>
                                        <button 
                                            onClick={() => handleCmsEdit(p.slug)}
                                            style={{
                                                width:'100%', textAlign:'left', padding:'10px', border:'none', 
                                                background: editingPage && editingPage.slug === p.slug ? '#e0f2fe' : 'white', 
                                                cursor:'pointer', borderLeft: editingPage && editingPage.slug === p.slug ? '4px solid #0284c7' : '4px solid transparent',
                                                boxShadow:'0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div style={{fontWeight:'bold'}}>{p.title}</div>
                                            <small style={{color:'#666'}}>/{p.slug}</small>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Editor */}
                        {editingPage ? (
                             <div style={{background: 'white', border: '1px solid #eee', padding:'20px', borderRadius:'8px'}}>
                                 <h3 style={{marginBottom:'20px'}}>Editando: {cmsFormData.title || 'Nueva Página'}</h3>
                                 <form onSubmit={handleCmsSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                     <div style={formGroup}>
                                        <label style={labelStyle}>Título de la Página</label>
                                        <input 
                                            value={cmsFormData.title} 
                                            onChange={e => setCmsFormData({...cmsFormData, title: e.target.value})} 
                                            required style={inputStyle}
                                        />
                                     </div>
                                     <div style={formGroup}>
                                        <label style={labelStyle}>Slug (URL)</label>
                                        <input 
                                            value={cmsFormData.slug} 
                                            onChange={e => setCmsFormData({...cmsFormData, slug: e.target.value})} 
                                            required style={inputStyle}
                                            disabled={!editingPage.isNew} 
                                            placeholder="ej: envios-devoluciones"
                                        />
                                     </div>
                                     <div style={formGroup}>
                                        <label style={labelStyle}>Contenido (HTML Soportado)</label>
                                        <textarea 
                                            value={cmsFormData.content} 
                                            onChange={e => setCmsFormData({...cmsFormData, content: e.target.value})} 
                                            required 
                                            style={{...inputStyle, minHeight:'300px', fontFamily:'monospace', fontSize:'14px'}}
                                        />
                                        <small style={{color:'#666'}}>Puedes usar etiquetas HTML como &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, etc.</small>
                                     </div>
                                     <div style={{display:'flex', gap:'10px'}}>
                                         <button type="submit" className="primary-btn">Guardar Contenido</button>
                                         <button type="button" onClick={() => setEditingPage(null)} className="secondary-btn">Cancelar</button>
                                     </div>
                                 </form>
                             </div>
                        ) : (
                            <div style={{padding:'50px', textAlign:'center', color:'#888', background:'#fafafa', border:'2px dashed #ddd', borderRadius:'8px'}}>
                                Selecciona una página de la izquierda para editar su contenido
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- PRODUCTS VIEW --- */}
            {activeTab === 'products' && (
                <>
                <div style={{display:'flex', gap:'20px', marginBottom: '20px'}}>
                     <div style={statCardStyle}>
                        <span style={statLabelStyle}>Productos Totales</span>
                        <strong style={statValueStyle}>{totalProducts}</strong>
                     </div>
                     <div style={statCardStyle}>
                        <span style={statLabelStyle}>Stock Crítico (&lt;10)</span>
                        <strong style={{...statValueStyle, color: '#dc2626'}}>{lowStock}</strong>
                     </div>
                     <div style={statCardStyle}>
                        <span style={statLabelStyle}>Valor Inventario</span>
                        <strong style={{...statValueStyle, color: '#166534'}}>${inventoryValue.toLocaleString()}</strong>
                     </div>
                </div>

                <div style={{background:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'20px', display:'flex', justifyContent:'space-between'}}>
                    <input 
                        placeholder="🔍 Buscar por SKU o Nombre..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{padding:'10px', width:'300px', border:'1px solid #ddd', borderRadius:'4px'}}
                    />
                    <button className="primary-btn" onClick={handleCreate} style={{ width: 'auto', padding: '10px 20px' }}>+ Nuevo Producto</button>
                </div>

                {showForm && (
                <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                        {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={formGroup}>
                            <label style={labelStyle}>SKU</label>
                            <input placeholder="Ej. MAQ-2023" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required style={inputStyle} />
                        </div>
                        <div style={formGroup}>
                            <label style={labelStyle}>Nombre del Producto</label>
                            <input placeholder="Nombre descriptivo" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={inputStyle} />
                        </div>
                        <div style={formGroup}>
                            <label style={labelStyle}>Precio Base (USD)</label>
                            <input placeholder="0.00" type="number" value={formData.price_base} onChange={e => setFormData({...formData, price_base: e.target.value})} required style={inputStyle} />
                        </div>
                        <div style={formGroup}>
                            <label style={labelStyle}>Stock Disponible</label>
                            <input placeholder="0" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required style={inputStyle} />
                        </div>
                        
                        <div style={formGroup}>
                            <label style={labelStyle}>Categoría</label>
                            <div style={{position: 'relative'}}>
                                <input 
                                    list="category-options" 
                                    placeholder="Seleccionar..." 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})} 
                                    style={inputStyle} 
                                    required
                                />
                                <datalist id="category-options">
                                    <option value="Maquinaria" />
                                    <option value="Seguridad" />
                                    <option value="Herramientas" />
                                    <option value="Electrónica" />
                                    <option value="Insumos" />
                                    <option value="Construcción" />
                                    <option value="Pinturas" />
                                </datalist>
                            </div>
                        </div>

                        <div style={formGroup}>
                             <label style={labelStyle}>URL Imagen Principal</label>
                             <input placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={inputStyle} />
                        </div>

                         <div style={{...formGroup, gridColumn: 'span 2'}}>
                            <label style={labelStyle}>Descripción Detallada</label>
                            <textarea placeholder="Descripción técnica del producto..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle, minHeight: '100px'}} />
                         </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" className="primary-btn">Guardar Cambios</button>
                            <button type="button" onClick={() => setShowForm(false)} className="secondary-btn">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#333', color: 'white', textAlign: 'left' }}>
                            <th style={thStyle}>SKU</th>
                            <th style={thStyle}>Producto</th>
                            <th style={thStyle}>Precio</th>
                            <th style={thStyle}>Stock</th>
                            <th style={thStyle}>Categoría</th>
                            <th style={thStyle}>Estado</th>
                            <th style={thStyle}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}><span style={{fontFamily:'monospace', background:'#f5f5f5', padding:'2px 4px'}}>{p.sku}</span></td>
                                <td style={tdStyle}>
                                    <div style={{fontWeight:'600'}}>{p.title}</div>
                                </td>
                                <td style={tdStyle}>$ {parseFloat(p.price_base).toLocaleString()}</td>
                                <td style={tdStyle}>
                                    {p.stock} Unid.
                                </td>
                                <td style={tdStyle}><span style={{background:'#e0f2fe', color:'#0369a1', padding:'2px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'600'}}>{p.category}</span></td>
                                <td style={tdStyle}>
                                    <span style={{
                                        color: p.stock > 10 ? '#15803d' : (p.stock > 0 ? '#b45309' : '#dc2626'),
                                        background: p.stock > 10 ? '#dcfce7' : (p.stock > 0 ? '#ffedd5' : '#fee2e2'),
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
                                    }}>
                                        {p.stock > 10 ? 'OK' : (p.stock > 0 ? 'Bajo' : 'Agotado')}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleEdit(p)} style={{ marginRight: '10px', cursor: 'pointer', color: '#2563eb', border: 'none', background: 'none', fontWeight:'600' }}>EDITAR</button>
                                    <button onClick={() => handleDelete(p.id)} style={{ cursor: 'pointer', color: '#dc2626', border: 'none', background: 'none', fontWeight:'600' }}>BORRAR</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div style={{padding:'40px', textAlign:'center', color:'#666'}}>No se encontraron productos</div>
                )}
            </div>
            </>
        )}
        </div>
    );
}

const statCardStyle = { background: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '120px' };
const statLabelStyle = { display: 'block', fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '5px' };
const statValueStyle = { fontSize: '24px', fontWeight: '800', color: '#333' };

const formGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#444' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const thStyle = { padding: '15px', fontSize: '14px', textTransform: 'uppercase' };
const tdStyle = { padding: '15px', fontSize: '14px' };

export default AdminDashboard;
