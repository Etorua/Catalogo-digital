import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingBag, 
    Megaphone, 
    FileText, 
    Settings, 
    LogOut, 
    Search, 
    Plus, 
    PenSquare, 
    Trash2, 
    Download, 
    LayoutList,
    Package,
    AlertTriangle,
    DollarSign,
    ClipboardList,
    CheckCircle
} from 'lucide-react';

function AdminDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'products' | 'cms' | 'marketing'
    const navigate = useNavigate();
    const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // --- Product Logic ---
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('TODOS');
    const [filterStock, setFilterStock] = useState('TODOS');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        sku: '', title: '', price_base: '', stock: '', category: 'General', description: '', image: ''
    });

    // --- CMS Logic ---
    const [pages, setPages] = useState([]);
    const [editingPage, setEditingPage] = useState(null);
    const [cmsFormData, setCmsFormData] = useState({ slug: '', title: '', content: '' });

    // --- Marketing Logic ---
    const [campaigns, setCampaigns] = useState([]);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [searchBestPrice, setSearchBestPrice] = useState('');
    const [searchFeatured, setSearchFeatured] = useState('');
    const [marketingFormData, setMarketingFormData] = useState({ 
        title: '', image_url: '', target_link: '', position: 'home_banner', is_active: true 
    });

    // --- User Logic ---
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchProducts(); // Always fetch products for stats
        if (activeTab === 'cms') fetchPages();
        if (activeTab === 'marketing') fetchMarketing();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchUsers = () => {
        axios.get('/api/admin/users').then(res => setUsers(res.data)).catch(console.error);
    };

    const handleRoleChange = async (userId, newRole) => {
        if(window.confirm(`¿Cambiar rol de usuario a ${newRole}?`)) {
            try {
                await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
                fetchUsers();
            } catch (err) {
                alert('Error al actualizar rol');
            }
        }
    };


    const fetchMarketing = () => {
        axios.get('/api/marketing').then(res => setCampaigns(res.data)).catch(console.error);
    };

    const handleMarketingSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCampaign) {
                await axios.put(`/api/marketing/${editingCampaign.id}`, marketingFormData);
            } else {
                await axios.post('/api/marketing', marketingFormData);
            }
            setEditingCampaign(null);
            setMarketingFormData({ title: '', image_url: '', target_link: '', position: 'home_banner', is_active: true });
            fetchMarketing();
        } catch (err) {
            alert('Error al guardar campaña');
        }
    };
    
    const handleEditCampaign = (camp) => {
        setEditingCampaign(camp);
        setMarketingFormData(camp);
    };

    const handleDeleteCampaign = async (id) => {
        if(window.confirm('¿Eliminar campaña?')) {
            await axios.delete(`/api/marketing/${id}`);
            fetchMarketing();
        }
    }

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

    // --- Export Handler ---
    const handleExportCSV = () => {
        const headers = ["ID", "SKU", "Nombre", "Categoria", "Precio", "Stock", "Estado"];
        const rows = filteredProducts.map(p => [
            p.id,
            p.sku || '-',
            `"${p.title ? p.title.replace(/"/g, '""') : ''}"`, 
            p.category || 'General',
            p.price_base,
            p.stock,
            p.stock > 10 ? 'ACTIVO' : (p.stock > 0 ? 'BAJO STOCK' : 'AGOTADO')
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Product Handlers ---
    const toggleProductFlag = async (product, flag) => {
        try {
            // Optimistic update
            const updatedProduct = { ...product, [flag]: !product[flag] };
            
            // Update local state immediately for snappy UI
            setProducts(products.map(p => p.id === product.id ? updatedProduct : p));

            // Send to DB
            // Ensure we send ALL fields required by the PUT endpoint
            await axios.put(`/api/products/${product.id}`, updatedProduct);
            
            // No need to fetchProducts() if optimistic update worked, but safer to do it eventually
        } catch (err) {
            console.error(err);
            alert('Error al actualizar estado del producto');
            fetchProducts(); // Revert on error
        }
    };

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
    const filteredProducts = products.filter(p => {
        const matchesTerm = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'TODOS' || p.category === filterCategory;
        const matchesStock = filterStock === 'TODOS' ? true : 
                             filterStock === 'BAJO' ? p.stock < 10 && p.stock > 0 :
                             filterStock === 'AGOTADO' ? p.stock === 0 :
                             p.stock >= 10; // ACTIVO
                             
        return matchesTerm && matchesCategory && matchesStock;
    });

    if (!user || user.role !== 'admin') {
        return <div style={{textAlign: 'center', marginTop: '50px', padding: '20px'}}>
            <h2>Acceso Restringido</h2>
            <p>Necesitas permisos de administrador para ver esta página.</p>
            <a href="/login" className="primary-btn" style={{textDecoration:'none', display:'inline-block', marginTop:'10px'}}>Iniciar Sesión</a>
        </div>;
    }

    // --- STYLES HELPER ---
    const formGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
    const labelStyle = { fontWeight: 'bold', fontSize: '14px', color: '#555' };
    const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };

    return (
        <div className="dashboard-layout">
            
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-title">:: Bienestar</div>
                    <div className="sidebar-subtitle">Centro de Control</div>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <button 
                            className={activeTab === 'dashboard' ? 'active' : ''} 
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'products' ? 'active' : ''} 
                            onClick={() => setActiveTab('products')}
                        >
                            <ShoppingBag size={18} /> Productos
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'marketing' ? 'active' : ''} 
                            onClick={() => setActiveTab('marketing')}
                        >
                            <Megaphone size={18} /> Marketing
                        </button>
                    </li>
                     <li>
                        <button 
                            className={activeTab === 'cms' ? 'active' : ''} 
                            onClick={() => setActiveTab('cms')}
                        >
                            <FileText size={18} /> Páginas
                        </button>
                    </li>
                    {/* Placeholder Items for Visual Completeness */}
                    <li>
                        <button 
                            className={activeTab === 'users' ? 'active' : ''} 
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={18} /> Usuarios
                        </button>
                    </li>
                    <li><button disabled style={{opacity:0.5}}><LayoutList size={18} /> Departamentos</button></li>
                    <li><button disabled style={{opacity:0.5}}><ClipboardList size={18} /> Reportes</button></li>
                    <li><button disabled style={{opacity:0.5}}><Settings size={18} /> Configuración</button></li>
                </ul>
                
                <div className="sidebar-footer">
                    <button style={{
                        background:'rgba(255,255,255,0.1)', color:'white', border:'none', 
                        width:'100%', padding:'10px', borderRadius:'4px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
                    }} onClick={() => navigate('/login')}>
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                
                 {/* Header */}
                 <div className="dashboard-header">
                    <div>
                        <div style={{color: '#666', fontSize: '14px', textTransform: 'capitalize'}}>{date}</div>
                        <h1 style={{margin: '5px 0 0 0', fontSize: '24px', color: '#333'}}>
                            {activeTab === 'dashboard' ? 'Resumen de Actividad' : 
                             activeTab === 'products' ? 'Gestión de Productos' :
                             activeTab === 'marketing' ? 'Campañas de Marketing' : 'Gestión de Contenidos'}
                        </h1>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <button className="secondary-btn">🔔</button>
                        <div style={{width:'40px', height:'40px', background:'#eee', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>
                             A
                        </div>
                    </div>
                 </div>

                 {/* --- DASHBOARD HOME VIEW --- */}
                 {activeTab === 'dashboard' && (
                     <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><Package size={24} color="#6a1b3d" /></div>
                                <div className="stat-value">{totalProducts}</div>
                                <div className="stat-label">Total de Productos</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><AlertTriangle size={24} color="#dc2626" /></div>
                                <div className="stat-value" style={{color: '#dc2626'}}>{lowStock}</div>
                                <div className="stat-label">Stock Crítico</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><DollarSign size={24} color="#166534" /></div>
                                <div className="stat-value" style={{color: '#166534'}}>${inventoryValue.toLocaleString()}</div>
                                <div className="stat-label">Valor Inventario</div>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><Megaphone size={24} color="#f96302" /></div>
                                <div className="stat-value">2</div>
                                <div className="stat-label">Campañas Activas</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><Users size={24} color="#0284c7" /></div>
                                <div className="stat-value">12</div>
                                <div className="stat-label">Nuevos Clientes (Mes)</div>
                            </div>
                             <div className="stat-card">
                                <div className="stat-icon-wrapper"><ClipboardList size={24} color="#4b5563" /></div>
                                <div className="stat-value">5</div>
                                <div className="stat-label">Pedidos Pendientes</div>
                            </div>
                        </div>

                        <h3 style={{marginTop: '40px'}}>Actividad Reciente</h3>
                        <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                            <p style={{color: '#666', fontStyle: 'italic'}}>No hay actividad reciente registrada en las últimas 24 horas.</p>
                        </div>
                     </>
                 )}

                {/* --- MARKETING VIEW --- */}
                {activeTab === 'marketing' && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    
                    {/* SECCION 1: ANUNCIOS (HERO BANNER) */}
                    <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                            <h3 style={{margin:0}}>1. Carrusel Principal (Anuncios)</h3>
                            <button className="primary-btn" style={{padding:'8px 15px', fontSize:'13px'}} onClick={() => {
                                setMarketingFormData({ title: '', image_url: '', target_link: '', position: 'home_hero', is_active: true });
                                setEditingCampaign({ isNew: true }); 
                            }}>+ Nuevo Anuncio</button>
                        </div>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'20px'}}>
                            {campaigns.filter(c => c.position === 'home_hero').map(c => (
                                <div key={c.id} style={{border:'1px solid #eee', borderRadius:'8px', overflow:'hidden', position:'relative'}}>
                                    <div style={{height:'100px', background:'#f0f0f0'}}>
                                        <img src={c.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt={c.title}/>
                                    </div>
                                    <div style={{padding:'10px'}}>
                                        <div style={{fontWeight:'bold', fontSize:'14px'}}>{c.title}</div>
                                        <div style={{fontSize:'12px', color:'#666', marginTop:'5px'}}>{c.target_link || 'Sin enlace'}</div>
                                    </div>
                                    <div style={{padding:'10px', background:'#f9f9f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span style={{fontSize:'11px', fontWeight:'bold', color: c.is_active ? 'green' : 'gray'}}>{c.is_active ? '● ACTIVO' : '○ INACTIVO'}</span>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button onClick={() => handleEditCampaign(c)} style={{cursor:'pointer', border:'none', background:'none'}}>✏️</button>
                                            <button onClick={() => handleDeleteCampaign(c.id)} style={{cursor:'pointer', border:'none', background:'none', color:'red'}}>🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {campaigns.filter(c => c.position === 'home_hero').length === 0 && <p style={{color:'#999', fontSize:'14px'}}>No hay anuncios activos.</p>}
                        </div>
                    </div>

                    {/* SECCION 2: BONIFICACIONES */}
                    <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                            <h3 style={{margin:0}}>2. Banner de Bonificaciones</h3>
                             <button className="primary-btn" style={{padding:'8px 15px', fontSize:'13px'}} onClick={() => {
                                 setMarketingFormData({ title: '', image_url: '', target_link: '', position: 'home_bonus', is_active: true });
                                 setEditingCampaign({ isNew: true }); 
                            }}>+ Nuevo Banner</button>
                        </div>
                         <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'20px'}}>
                            {campaigns.filter(c => c.position === 'home_bonus').map(c => (
                                <div key={c.id} style={{border:'1px solid #eee', borderRadius:'8px', overflow:'hidden', position:'relative'}}>
                                    <div style={{height:'100px', background:'#f0f0f0'}}>
                                        <img src={c.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt={c.title}/>
                                    </div>
                                    <div style={{padding:'10px'}}>
                                        <div style={{fontWeight:'bold', fontSize:'14px'}}>{c.title}</div>
                                        <div style={{fontSize:'12px', color:'#666', marginTop:'5px'}}>{c.target_link || 'Sin enlace'}</div>
                                    </div>
                                    <div style={{padding:'10px', background:'#f9f9f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                         <span style={{fontSize:'11px', fontWeight:'bold', color: c.is_active ? 'green' : 'gray'}}>{c.is_active ? '● ACTIVO' : '○ INACTIVO'}</span>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button onClick={() => handleEditCampaign(c)} style={{cursor:'pointer', border:'none', background:'none'}}>✏️</button>
                                            <button onClick={() => handleDeleteCampaign(c.id)} style={{cursor:'pointer', border:'none', background:'none', color:'red'}}>🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {campaigns.filter(c => c.position === 'home_bonus').length === 0 && <p style={{color:'#999', fontSize:'14px'}}>No hay banner de bonificaciones.</p>}
                        </div>
                    </div>

                    {/* SECCION 3 y 4: PRODUCTOS DESTACADOS */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        
                        {/* Mejores Precios */}
                        <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                            <h3 style={{marginTop:0}}>3. Mejores Precios</h3>
                            <p style={{fontSize:'12px', color:'#666', marginBottom:'15px'}}>Selecciona productos para la sección de ofertas.</p>
                            
                            {/* Selected List */}
                            <div style={{marginBottom:'15px', maxHeight:'200px', overflowY:'auto', background:'#f9f9f9', padding:'10px', borderRadius:'4px', border:'1px solid #eee'}}>
                                <h5 style={{margin:'0 0 10px 0'}}>Seleccionados ({products.filter(p=>p.is_best_price).length})</h5>
                                {products.filter(p=>p.is_best_price).map(p => (
                                    <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px', padding:'5px 0', borderBottom:'1px solid #eee'}}>
                                        <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'200px'}}>{p.title}</span>
                                        <button onClick={() => toggleProductFlag(p, 'is_best_price')} style={{color:'#c00', border:'none', background:'none', cursor:'pointer', fontSize:'14px', fontWeight:'bold'}}>✖</button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Search */}
                            <div style={{position:'relative'}}>
                                <input 
                                    placeholder="🔍 Buscar para agregar..." 
                                    value={searchBestPrice}
                                    onChange={e => setSearchBestPrice(e.target.value)}
                                    style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px', boxSizing:'border-box'}}
                                />
                                {searchBestPrice && (
                                   <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', zIndex:10, maxHeight:'200px', overflowY:'auto', border:'1px solid #eee'}}>
                                       {products.filter(p => !p.is_best_price && p.title.toLowerCase().includes(searchBestPrice.toLowerCase())).map(p => (
                                           <div key={p.id} 
                                                onClick={() => { toggleProductFlag(p, 'is_best_price'); setSearchBestPrice(''); }}
                                                style={{padding:'8px', cursor:'pointer', borderBottom:'1px solid #eee', fontSize:'13px', display:'flex', justifyContent:'space-between'}}
                                           >
                                                <span>{p.title}</span>
                                                <span style={{color:'green', fontWeight:'bold'}}>+ Agregar</span>
                                           </div>
                                       ))}
                                   </div>
                                )}
                            </div>
                        </div>

                        {/* Descubre Productos */}
                        <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                            <h3 style={{marginTop:0}}>4. Descubre Productos</h3>
                            <p style={{fontSize:'12px', color:'#666', marginBottom:'15px'}}>Selecciona productos para la sección de descubrimiento.</p>
                            
                             {/* Selected List */}
                             <div style={{marginBottom:'15px', maxHeight:'200px', overflowY:'auto', background:'#f9f9f9', padding:'10px', borderRadius:'4px', border:'1px solid #eee'}}>
                                <h5 style={{margin:'0 0 10px 0'}}>Seleccionados ({products.filter(p=>p.is_featured).length})</h5>
                                {products.filter(p=>p.is_featured).map(p => (
                                    <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px', padding:'5px 0', borderBottom:'1px solid #eee'}}>
                                        <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'200px'}}>{p.title}</span>
                                        <button onClick={() => toggleProductFlag(p, 'is_featured')} style={{color:'#c00', border:'none', background:'none', cursor:'pointer', fontSize:'14px', fontWeight:'bold'}}>✖</button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Search */}
                            <div style={{position:'relative'}}>
                                <input 
                                    placeholder="🔍 Buscar para agregar..." 
                                    value={searchFeatured}
                                    onChange={e => setSearchFeatured(e.target.value)}
                                    style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px', boxSizing:'border-box'}}
                                />
                                {searchFeatured && (
                                   <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', zIndex:10, maxHeight:'200px', overflowY:'auto', border:'1px solid #eee'}}>
                                       {products.filter(p => !p.is_featured && p.title.toLowerCase().includes(searchFeatured.toLowerCase())).map(p => (
                                           <div key={p.id} 
                                                onClick={() => { toggleProductFlag(p, 'is_featured'); setSearchFeatured(''); }}
                                                style={{padding:'8px', cursor:'pointer', borderBottom:'1px solid #eee', fontSize:'13px', display:'flex', justifyContent:'space-between'}}
                                           >
                                                <span>{p.title}</span>
                                                <span style={{color:'green', fontWeight:'bold'}}>+ Agregar</span>
                                           </div>
                                       ))}
                                   </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal/Form for Campaigns (Hidden by default) */}
                    {editingCampaign && (
                        <div style={{
                            position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', 
                            display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000
                        }}>
                            <div style={{background:'white', padding:'30px', borderRadius:'8px', width:'400px', boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
                                <h3 style={{marginTop:0, marginBottom:'20px'}}>{marketingFormData.id ? 'Editar' : 'Crear'} Elemento</h3>
                                <form onSubmit={(e) => {
                                    handleMarketingSubmit(e);
                                }} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                    
                                    <div style={formGroup}>
                                        <label style={labelStyle}>Título</label>
                                        <input value={marketingFormData.title} onChange={e=>setMarketingFormData({...marketingFormData, title:e.target.value})} placeholder="Ej. Oferta de Verano" required style={inputStyle} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={labelStyle}>URL Imagen</label>
                                        <input value={marketingFormData.image_url} onChange={e=>setMarketingFormData({...marketingFormData, image_url:e.target.value})} placeholder="https://..." required style={inputStyle} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={labelStyle}>Enlace Destino</label>
                                        <input value={marketingFormData.target_link} onChange={e=>setMarketingFormData({...marketingFormData, target_link:e.target.value})} placeholder="/producto/123" style={inputStyle} />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={labelStyle}>Posición</label>
                                        <select value={marketingFormData.position} disabled style={{...inputStyle, background:'#eee'}}>
                                            <option value="home_hero">Carrusel Principal</option>
                                            <option value="home_bonus">Bonificaciones</option>
                                        </select>
                                    </div>
                                    
                                    <label style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'14px'}}>
                                        <input type="checkbox" checked={marketingFormData.is_active} onChange={e=>setMarketingFormData({...marketingFormData, is_active:e.target.checked})} /> 
                                        Elemento Activo
                                    </label>

                                    <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                        <button className="primary-btn" type="submit" style={{flex:1}}>Guardar</button>
                                        <button className="secondary-btn" type="button" onClick={()=>setEditingCampaign(null)} style={{flex:1}}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            )}

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

            
            {/* --- USERS VIEW --- */}
            {activeTab === 'users' && (
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <h2 style={{marginBottom: '20px'}}>Gestión de Usuarios</h2>
                    
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                <tr>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>ID</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Usuario</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Empresa / RFC</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Rol Actual</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Asignar Rol</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Fecha Reg.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                        <td style={{padding:'12px'}}>{u.id}</td>
                                        <td style={{padding:'12px'}}>
                                            <div style={{fontWeight:'bold'}}>{u.full_name}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{u.email}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{u.phone}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <div>{u.company_name || u.legal_name || '-'}</div>
                                            <div style={{fontSize:'12px', color:'#666'}}>
                                                {u.rfc || 'Sin RFC'} <span style={{background:'#e0f2fe', padding:'2px 4px', borderRadius:'4px', fontSize:'10px'}}>{u.person_type}</span>
                                            </div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <span style={{
                                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'customer' ? '#e0f2fe' : '#fef3c7',
                                                color: u.role === 'admin' ? '#991b1b' : u.role === 'customer' ? '#075985' : '#92400e',
                                                padding: '4px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'bold'
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <select 
                                                value={u.role} 
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                style={{padding:'6px', borderRadius:'4px', border:'1px solid #ddd', width: '130px'}}
                                                disabled={u.email === user.email} // Prevent self-lockout
                                            >
                                                <option value="customer">Cliente</option>
                                                <option value="seller">Vendedor</option>
                                                <option value="accountant">Contador</option>
                                                <option value="warehouse">Almacenista</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td style={{padding:'12px', color:'#666'}}>
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- PRODUCTS VIEW --- */}
            {activeTab === 'products' && (
                <>
                {/* Filters Row */}
                <div style={{background:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'20px'}}>
                    <div style={{display:'flex', gap:'20px', marginBottom: '15px'}}>
                        <div style={{flex:1}}>
                            <label style={{display:'block', fontSize:'12px', fontWeight:'bold', marginBottom:'5px', color:'#666'}}>Estado</label>
                            <select 
                                value={filterStock}
                                onChange={e => setFilterStock(e.target.value)}
                                style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}}
                            >
                                <option value="TODOS">TODOS</option>
                                <option value="ACTIVO">ACTIVOS</option>
                                <option value="BAJO">BAJO STOCK</option>
                                <option value="AGOTADO">AGOTADOS</option>
                            </select>
                        </div>
                        <div style={{flex:1}}>
                            <label style={{display:'block', fontSize:'12px', fontWeight:'bold', marginBottom:'5px', color:'#666'}}>Categoría</label>
                            <select 
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}}
                            >
                                <option value="TODOS">TODAS</option>
                                <option value="Maquinaria">Maquinaria</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="Herramientas">Herramientas</option>
                                <option value="Electrónica">Electrónica</option>
                                <option value="Insumos">Insumos</option>
                                <option value="Construcción">Construcción</option>
                                <option value="Pinturas">Pinturas</option>
                            </select>
                        </div>
                        <div style={{flex:1}}>
                            {/* Placeholder for future Dept filter */}
                            <label style={{display:'block', fontSize:'12px', fontWeight:'bold', marginBottom:'5px', color:'#666'}}>Departamento</label>
                            <select disabled style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px', background:'#f5f5f5'}}>
                                <option>GENERAL</option>
                            </select>
                        </div>
                        <div style={{display:'flex', alignItems:'end', gap:'10px'}}>
                            <button className="secondary-btn" onClick={handleExportCSV} style={{padding:'8px 15px'}}>
                                <Download size={16} /> Excel
                            </button>
                            <button className="secondary-btn" style={{padding:'8px 15px'}}>
                                <LayoutList size={16} /> Columnas
                            </button>
                        </div>
                    </div>

                    <div style={{borderTop:'1px solid #eee', paddingTop:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div style={{position:'relative', width:'70%'}}>
                             <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', opacity:0.5}}><Search size={16}/></span>
                             <input 
                                placeholder="Buscar productos..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{padding:'10px 10px 10px 35px', width:'100%', border:'1px solid #ddd', borderRadius:'4px', boxSizing:'border-box'}}
                            />
                        </div>
                         <button className="primary-btn" onClick={handleCreate} style={{ width: 'auto', padding: '10px 25px', borderRadius:'20px' }}>
                            <Plus size={16} /> Agregar
                         </button>
                    </div>
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

                         <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Descripción</label>
                            <textarea placeholder="Detalles del producto..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle, height: '100px'}} />
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                             <button type="submit" className="primary-btn" style={{ flex: 1 }}>Guardar Producto</button>
                             <button type="button" onClick={() => setShowForm(false)} className="secondary-btn" style={{ flex: 1 }}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
                        <thead>
                            <tr style={{borderBottom:'2px solid #eee', color:'#444'}}>
                                <th style={{padding:'15px', textAlign:'left', width:'40px'}}><input type="checkbox"/></th>
                                <th style={{padding:'15px', textAlign:'left'}}>Producto</th>
                                <th style={{padding:'15px', textAlign:'left'}}>SKU</th>
                                <th style={{padding:'15px', textAlign:'left'}}>Categoría</th>
                                <th style={{padding:'15px', textAlign:'left'}}>Precio</th>
                                <th style={{padding:'15px', textAlign:'left'}}>Stock</th>
                                <th style={{padding:'15px', textAlign:'left'}}>Estado</th>
                                <th style={{padding:'15px', textAlign:'right'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id} style={{borderBottom:'1px solid #f9f9f9', transition:'background 0.2s'}}>
                                    <td style={{padding:'15px'}}><input type="checkbox"/></td>
                                    <td style={{padding:'15px'}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                            <img 
                                                src={Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (typeof p.images === 'string' ? p.images : 'https://placehold.co/40px')} 
                                                style={{width:'40px', height:'40px', borderRadius:'4px', objectFit:'cover'}}
                                                alt=""
                                            />
                                            <span style={{fontWeight:'600', color:'#333'}}>{p.title}</span>
                                        </div>
                                    </td>
                                    <td style={{padding:'15px', fontFamily:'monospace', color:'#666'}}>{p.sku}</td>
                                    <td style={{padding:'15px'}}>{p.category}</td>
                                    <td style={{padding:'15px', fontWeight:'bold'}}>${Number(p.price_base).toFixed(2)}</td>
                                    <td style={{padding:'15px'}}>{p.stock}</td>
                                    <td style={{padding:'15px'}}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold',
                                            background: p.stock > 10 ? '#d1fae5' : (p.stock > 0 ? '#ffedd5' : '#fee2e2'),
                                            color: p.stock > 10 ? '#065f46' : (p.stock > 0 ? '#9a3412' : '#991b1b')
                                        }}>
                                            {p.stock > 10 ? 'ACTIVO' : (p.stock > 0 ? 'BAJO STOCK' : 'AGOTADO')}
                                        </span>
                                    </td>
                                    <td style={{padding:'15px', textAlign:'right'}}>
                                        <button onClick={() => handleEdit(p)} style={{background:'none', border:'none', cursor:'pointer', marginRight:'10px', color:'#4b5563'}} title="Editar">
                                            <PenSquare size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#dc2626'}} title="Eliminar">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{padding:'40px', textAlign:'center', color:'#888'}}>
                                        No se encontraron productos con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            </div>
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
