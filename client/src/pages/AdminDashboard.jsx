import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { PosTicket } from '../components/PosTicket';
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
    CheckCircle,
    ShoppingCart,
    Calculator,
    Truck,
    Banknote,
    BarChart3,
    Receipt,
    CreditCard,
    UserCog
} from 'lucide-react';

function AdminDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pos' | 'inventory' | 'clients' | 'suppliers' | 'cash' | 'reports' | 'settings'
    const navigate = useNavigate();
    const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // --- Product Logic ---
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('TODOS');
    const [filterStock, setFilterStock] = useState('TODOS');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState('general'); // 'general', 'pricing', 'stock'
    const [formData, setFormData] = useState({
        sku: '', title: '', price_base: '', stock: '', category: 'General', description: '', image: '',
        brand: '', barcode: '', location: '', cost_price: '', stock_min: '', stock_max: '', rubro: '', unit: 'un', tax_rate: 16, supplier_code: '', weight: ''
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

    // --- POS Logic ---
    const [posCart, setPosCart] = useState([]);
    const [posSearch, setPosSearch] = useState('');
    const [posClient, setPosClient] = useState({ id: 0, name: 'Público General', rfc: 'XAXX010101000' });

    const addToPosCart = (product) => {
        const existing = posCart.find(item => item.id === product.id);
        if (existing) {
            setPosCart(posCart.map(item => 
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setPosCart([...posCart, { ...product, qty: 1 }]);
        }
    };

    const removeFromPosCart = (productId) => {
        setPosCart(posCart.filter(item => item.id !== productId));
    };

    const updatePosQty = (productId, newQty) => {
        if (newQty < 1) return;
        setPosCart(posCart.map(item => 
            item.id === productId ? { ...item, qty: newQty } : item
        ));
    };

    const clearPosCart = () => {
        setPosCart([]);
        setPosSearch('');
        setPosClient({ id: 0, name: 'Público General', rfc: 'XAXX010101000' });
    };

    // --- Print Logic ---
    const [orderToPrint, setOrderToPrint] = useState(null);
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () => setOrderToPrint(null)
    });

    useEffect(() => {
        if (orderToPrint) {
            handlePrint();
        }
    }, [orderToPrint]);

    const handlePosCheckout = async (method) => {
        if (posCart.length === 0) return alert('El carrito está vacío');
        
        try {
            const total = posCart.reduce((acc, item) => acc + (item.price_base * item.qty), 0);
            const orderData = {
                customer_name: posClient.name,
                customer_email: 'mostrador@ferreteriaplus.com',
                items: posCart.map(i => ({ 
                    id: i.id, 
                    title: i.title, 
                    price: i.price_base, 
                    quantity: i.qty 
                })),
                total: total,
                status: 'completed',
                payment_method: method
            };

            const res = await axios.post('/api/orders/create_pos', orderData); 
            // alert(`Venta registrada con éxito!\nTotal: $${total.toFixed(2)}`); // Replaced by print dialog
            setOrderToPrint({ ...orderData, id: res.data.orderId, date: new Date() });
            
            clearPosCart();
            fetchOrders(); 
        } catch (err) {
            console.error(err);
            alert('Error al procesar la venta');
        }
    };

    // --- User Logic ---
    const [users, setUsers] = useState([]);

    // --- Clients Logic ---
    const [clients, setClients] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [editingClient, setEditingClient] = useState(null);
    const [clientForm, setClientForm] = useState({
         full_name: '', rfc: '', email: '', phone: '', address: '', city: '', note: '', credit_limit: 0
    });

    const fetchClients = () => {
        axios.get(`/api/clients?search=${clientSearch}`).then(res => setClients(res.data)).catch(console.error);
    };

    const handleSaveClient = async (e) => {
        e.preventDefault();
        try {
            if (editingClient.id) {
                await axios.put(`/api/clients/${editingClient.id}`, clientForm);
            } else {
                await axios.post('/api/clients', clientForm);
            }
            fetchClients();
            setEditingClient(null);
        } catch (err) {
            console.error(err);
            alert('Error al guardar cliente');
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm("¿Eliminar Cliente?")) return;
        try {
            await axios.delete(`/api/clients/${id}`);
            fetchClients();
        } catch (err) {
            console.error(err);
        }
    };

    const openClientModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setClientForm(client);
        } else {
            setEditingClient({ id: 0 }); // 0 flag for new
            setClientForm({ full_name: '', rfc: '', email: '', phone: '', address: '', city: '', note: '', credit_limit: 0 });
        }
    };

    // --- Cash Logic ---
    const [cashStatus, setCashStatus] = useState({ isOpen: false, currentBalance: 0, movements: [] });
    
    const fetchCashStatus = () => {
        axios.get('/api/cash/status')
             .then(res => setCashStatus(res.data))
             .catch(console.error);
    };

    const handleOpenRegister = async (e) => {
        e.preventDefault();
        const amount = e.target.amount.value;
        const notes = e.target.notes.value;
        try {
            await axios.post('/api/cash/open', { amount, notes });
            fetchCashStatus();
        } catch(error) { 
            alert('Error al abrir caja'); 
            console.error(error); 
        }
    };

    const handleCloseRegister = async (e) => {
        e.preventDefault();
        if(!window.confirm("¿Estás seguro de realizar el corte de caja?")) return;
        const closing_amount = e.target.closing_amount.value;
        const notes = e.target.notes.value;
        
        try {
            const res = await axios.post('/api/cash/close', { closing_amount, notes });
            const diff = parseFloat(res.data.closing_amount) - parseFloat(res.data.calculated_amount);
            alert(`Caja cerrada exitosamente.\nDiferencia: $${diff.toFixed(2)}`);
            fetchCashStatus();
        } catch(error) { 
            alert('Error al cerrar caja'); 
        }
    };

    const handleCashMovement = async (type, amount, description) => {
        try {
            await axios.post('/api/cash/movement', { type, amount, description });
            fetchCashStatus();
        } catch(e) { alert('Error registrando movimiento'); }
    };

    // --- Suppliers Logic ---
    const [suppliers, setSuppliers] = useState([]);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [supplierForm, setSupplierForm] = useState({ company_name: '', contact_name: '', rfc: '', email: '', phone: '' });

    const fetchSuppliers = () => {
        axios.get(`/api/suppliers?search=${supplierSearch}`).then(res => setSuppliers(res.data)).catch(console.error);
    };

    const handleSaveSupplier = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier.id) {
                await axios.put(`/api/suppliers/${editingSupplier.id}`, supplierForm);
            } else {
                await axios.post('/api/suppliers', supplierForm);
            }
            fetchSuppliers();
            setEditingSupplier(null);
        } catch(e) { alert('Error guardando proveedor'); }
    };

    const handleDeleteSupplier = async (id) => {
        if(!window.confirm("¿Eliminar Proveedor?")) return;
        try { await axios.delete(`/api/suppliers/${id}`); fetchSuppliers(); } catch(e) { console.error(e); }
    };

    const openSupplierModal = (sup = null) => {
        if(sup) {
             setEditingSupplier(sup);
             setSupplierForm(sup);
        } else {
             setEditingSupplier({id:0});
             setSupplierForm({ company_name: '', contact_name: '', rfc: '', email: '', phone: '', credit_days: 0, notes: '', city: '', address: '' });
        }
    };

    // --- Order Logic ---
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchProducts(); // Always fetch products for stats
        if (activeTab === 'cms') fetchPages();
        if (activeTab === 'marketing') fetchMarketing();
        if (activeTab === 'promotions') {
            fetchPromotions();
            fetchPromoBanner();
        }
        if (activeTab === 'pro_requests') fetchProRequests();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'clients') fetchClients(); 
        if (activeTab === 'cash') fetchCashStatus();
        if (activeTab === 'suppliers') fetchSuppliers();
    }, [activeTab]);

    const fetchOrders = () => {
        axios.get('/api/orders/admin').then(res => setOrders(res.data)).catch(console.error);
    };

    const handleViewOrder = async (orderId) => {
        try {
            const res = await axios.get(`/api/orders/admin/${orderId}`);
            setSelectedOrder(res.data);
        } catch (err) {
            alert('Error cargando orden');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/admin/${orderId}/status`, { status: newStatus });
            if (selectedOrder) setSelectedOrder({...selectedOrder, status: newStatus});
            fetchOrders();
        } catch (err) {
            alert('Error actualizando estatus');
        }
    }

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
            const slug = editingCampaign.slug || marketingFormData.slug;
            if (!slug) return alert("Error: No SLUG definido");

            await axios.put(`/api/marketing/${slug}`, marketingFormData);
            
            setEditingCampaign(null);
            setMarketingFormData({ title: '', image_url: '', target_link: '', content: null, is_active: true });
            fetchMarketing();
            alert('Guardado correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al guardar campaña');
        }
    };
    
    const handleEditCampaign = (camp) => {
        setEditingCampaign(camp);
        setMarketingFormData(camp);
    };

    // --- Promotions Logic ---
    const [promotions, setPromotions] = useState([]);
    const [promoBanner, setPromoBanner] = useState({ title: '', content: '', image_url: '', target_link: '' });
    const [editingPromo, setEditingPromo] = useState(null);
    const [activePromoTab, setActivePromoTab] = useState('list'); // 'list' | 'banner'
    const [promoFormData, setPromoFormData] = useState({
        title: '', description: '', target_link: '', badge_text: '', badge_color: '#f96302', display_order: 0, is_active: true
    });

    const fetchPromotions = () => {
        axios.get('/api/promotions?all=true').then(res => setPromotions(res.data)).catch(console.error);
    };

    const fetchPromoBanner = () => {
         axios.get('/api/marketing/promo_main_banner')
            .then(res => setPromoBanner(res.data || { title: '', content: '', image_url: '', target_link: '' }))
            .catch(() => {});
    };

    const handleSavePromo = async (e) => {
        e.preventDefault();
        try {
            if (editingPromo) {
                await axios.put(`/api/promotions/${editingPromo.id}`, promoFormData);
            } else {
                await axios.post('/api/promotions', promoFormData);
            }
            fetchPromotions();
            setEditingPromo(null);
            setPromoFormData({ title: '', description: '', target_link: '', badge_text: '', badge_color: '#f96302', display_order: 0, is_active: true });
            alert('Promoción guardada');
        } catch (err) {
            alert('Error guardando promoción');
            console.error(err);
        }
    };

    const handleEditPromo = (promo) => {
        setEditingPromo(promo);
        setPromoFormData(promo);
    }

    const handleSavePromoBanner = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/marketing/promo_main_banner', { 
                ...promoBanner,
                slug: 'promo_main_banner' 
            });
            alert('Banner guardado');
            fetchPromoBanner();
        } catch (err) {
            alert('Error guardando banner');
        }
    };
    
    // --- Contact Requests Logic ---
    const [proRequests, setProRequests] = useState([]);
    const fetchProRequests = () => {
        axios.get('/api/contact/pro-requests').then(res => setProRequests(res.data)).catch(console.error);
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
        setFormData({ 
            ...product, 
            image: img || '',
            // Ensure defaults for null values
            brand: product.brand || '',
            barcode: product.barcode || '',
            location: product.location || '',
            cost_price: product.cost_price || 0,
            stock_min: product.stock_min || 0,
            stock_max: product.stock_max || 0,
            rubro: product.rubro || '',
            unit: product.unit || 'un',
            tax_rate: product.tax_rate || 16,
            supplier_code: product.supplier_code || '',
            weight: product.weight || 0
        });
        setActiveFormTab('general');
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setFormData({ 
            sku: '', title: '', price_base: '', stock: '', category: 'General', description: '', image: '',
            brand: '', barcode: '', location: '', cost_price: '', stock_min: '', stock_max: '', rubro: '', unit: 'un', tax_rate: 16, supplier_code: '', weight: ''
        });
        setActiveFormTab('general');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...formData, 
                images: [formData.image || 'https://placehold.co/600x400'],
                // Ensure numbers are sent as numbers
                price_base: parseFloat(formData.price_base),
                stock: parseInt(formData.stock),
                cost_price: parseFloat(formData.cost_price),
                stock_min: parseInt(formData.stock_min),
                stock_max: parseInt(formData.stock_max),
                tax_rate: parseFloat(formData.tax_rate),
                weight: parseFloat(formData.weight)
            };
            
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id}`, payload);
            } else {
                await axios.post('/api/products', { ...payload, lead_score: 5, currency: 'USD' });
            }
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Error al guardar: ' + (err.response?.data?.msg || err.message));
        }
    };

    // Derived State for Stats
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock < 10).length;
    const inventoryValue = products.reduce((acc, p) => acc + (p.price_base * p.stock), 0);
    
    // Order Stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const itemsSold = orders.reduce((acc, o) => acc + parseInt(o.items_count || 0), 0);
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + parseFloat(o.total || 0), 0);

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
                            <LayoutDashboard size={18} /> Tablero
                        </button>
                    </li>
                    <div className="menu-section-label">OPERACIONES</div>
                    <li>
                        <button 
                            className={activeTab === 'pos' ? 'active' : ''} 
                            onClick={() => setActiveTab('pos')}
                        >
                            <ShoppingCart size={18} /> Mostrador / POS
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'inventory' ? 'active' : ''} 
                            onClick={() => setActiveTab('inventory')}
                        >
                            <Package size={18} /> Inventario
                        </button>
                    </li>
                    
                    <div className="menu-section-label">GESTIÓN</div>
                    <li>
                        <button 
                            className={activeTab === 'clients' ? 'active' : ''} 
                            onClick={() => setActiveTab('clients')}
                        >
                            <Users size={18} /> Clientes
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'suppliers' ? 'active' : ''} 
                            onClick={() => setActiveTab('suppliers')}
                        >
                            <Truck size={18} /> Proveedores
                        </button>
                    </li>

                    <div className="menu-section-label">MARKETING</div>
                     <li>
                        <button 
                            className={activeTab === 'promotions' ? 'active' : ''} 
                            onClick={() => setActiveTab('promotions')}
                        >
                            <Megaphone size={18} /> Ofertas y Promos
                        </button>
                    </li>
                     <li>
                        <button 
                            className={activeTab === 'pro_requests' ? 'active' : ''} 
                            onClick={() => setActiveTab('pro_requests')}
                        >
                            <FileText size={18} /> Solicitudes Web
                        </button>
                    </li>

                    <div className="menu-section-label">FINANZAS</div>
                    <li>
                        <button 
                            className={activeTab === 'cash' ? 'active' : ''} 
                            onClick={() => setActiveTab('cash')}
                        >
                            <Banknote size={18} /> Caja
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'reports' ? 'active' : ''} 
                            onClick={() => setActiveTab('reports')}
                        >
                            <BarChart3 size={18} /> Reportes
                        </button>
                    </li>

                    <div className="menu-section-label">SISTEMA</div>
                    <li>
                        <button 
                            className={activeTab === 'settings' ? 'active' : ''} 
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} /> Configuración
                        </button>
                    </li>
                </ul>
                <style>{`
                    .menu-section-label {
                        font-size: 11px;
                        font-weight: bold;
                        color: #888;
                        padding: 10px 15px 5px;
                        margin-top: 10px;
                        letter-spacing: 0.5px;
                    }
                `}</style>
                
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
                        <h1 style={{margin: '5px 0 0 0', fontSize: '24px', color: '#333'}} translate="no">
                            {activeTab === 'dashboard' && <span key="dashboard">Panel de Control General</span>}
                            {activeTab === 'pos' && <span key="pos">Punto de Venta (POS)</span>}
                            {activeTab === 'inventory' && <span key="inventory">Gestión de Inventario</span>}
                            {activeTab === 'clients' && <span key="clients">Base de Clientes</span>}
                            {activeTab === 'suppliers' && <span key="suppliers">Proveedores y Compras</span>}
                            {activeTab === 'cash' && <span key="cash">Control de Caja</span>}
                            {activeTab === 'reports' && <span key="reports">Reportes y Estadísticas</span>}
                            {activeTab === 'settings' && <span key="settings">Configuración del Sistema</span>}
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
                                <div className="stat-label">Artículos en Maestro</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><AlertTriangle size={24} color="#dc2626" /></div>
                                <div className="stat-value" style={{color: '#dc2626'}}>{lowStock}</div>
                                <div className="stat-label">Stock Crítico / Reponer</div>
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
                                <div className="stat-value">{campaigns.filter(c => c.is_active).length}</div>
                                <div className="stat-label">Campañas Activas</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper"><Users size={24} color="#0284c7" /></div>
                                <div className="stat-value">{users.length}</div>
                                <div className="stat-label">Usuarios Registrados</div>
                            </div>
                             <div className="stat-card">
                                <div className="stat-icon-wrapper"><ClipboardList size={24} color="#4b5563" /></div>
                                <div className="stat-value">{pendingOrders}</div>
                                <div className="stat-label">Pedidos Pendientes</div>
                            </div>
                        </div>

                        <div className="stats-grid" style={{marginTop: '20px'}}>
                            <div className="stat-card" style={{gridColumn: 'span 3'}}>
                                <div className="stat-icon-wrapper"><DollarSign size={24} color="#166534" /></div>
                                <div className="stat-value" style={{color: '#166534'}}>${revenue.toLocaleString()}</div>
                                <div className="stat-label">Ventas Totales (Realizadas)</div>
                            </div>
                        </div>

                        <h3 style={{marginTop: '40px'}}>Actividad Reciente</h3>
                        <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                            {orders.slice(0, 5).map(o => (
                                <div key={o.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee'}}>
                                    <div>
                                        <strong>Orden #{o.id}</strong> - {o.customer_name}
                                    </div>
                                    <div>
                                        <span onClick={() => setActiveTab('orders')} style={{cursor:'pointer', padding:'2px 8px', borderRadius:'4px', fontSize:'12px', background: o.status === 'pending' ? '#fef3c7' : '#dcfce7', color: o.status === 'pending' ? '#92400e' : '#166534'}}>
                                            {o.status.toUpperCase()}
                                        </span>
                                        <span style={{marginLeft: '10px'}}>${parseFloat(o.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && <p style={{color: '#666', fontStyle: 'italic'}}>No hay actividad reciente.</p>}
                        </div>
                     </>
                 )}

                 {/* --- POS (Punto de Venta) --- */}
                 {activeTab === 'pos' && (
                     <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px', height:'calc(100vh - 150px)'}}>
                        
                        {/* LEFT: ADD PRODUCTS */}
                        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                            
                            {/* Search Bar */}
                            <div style={{background:'white', padding:'15px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', display:'flex', gap:'10px'}}>
                                <div style={{position:'relative', flex:1}}>
                                    <Search size={20} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#999'}} />
                                    <input 
                                        autoFocus
                                        placeholder="Buscar por código de barras, SKU o nombre..." 
                                        value={posSearch}
                                        onChange={e => setPosSearch(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const found = products.find(p => p.sku === posSearch || p.barcode === posSearch);
                                                if (found) {
                                                    addToPosCart(found);
                                                    setPosSearch('');
                                                }
                                            }
                                        }}
                                        style={{width:'100%', padding:'12px 12px 12px 40px', fontSize:'16px', border:'1px solid #ddd', borderRadius:'4px', outline:'none', boxSizing:'border-box'}} 
                                    />
                                </div>
                            </div>

                            {/* Product Select Grid */}
                            <div style={{flex:1, overflowY:'auto', background:'white', padding:'15px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                                {posSearch.length === 0 ? (
                                    <div style={{textAlign:'center', marginTop:'50px', color:'#999'}}>
                                        <ShoppingCart size={48} style={{opacity:0.2, marginBottom:'10px'}} />
                                        <p>Escanee un producto o escriba para buscar.</p>
                                        <div style={{marginTop:'30px', textAlign:'left'}}>
                                            <h4 style={{marginLeft:'10px', marginBottom:'10px'}}>Productos Frecuentes</h4>
                                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px'}}>
                                                {products.slice(0, 8).map(p => (
                                                    <button key={p.id} onClick={() => addToPosCart(p)} style={{border:'1px solid #eee', background:'white', padding:'10px', borderRadius:'6px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:'5px', transition:'all 0.1s', ':hover':{borderColor:'#aaa'}}}>
                                                        <div style={{fontSize:'12px', fontWeight:'bold', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%'}}>{p.title}</div>
                                                        <div style={{fontSize:'14px', color:'#166534', fontWeight:'bold'}}>${Number(p.price_base).toFixed(2)}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'15px'}}>
                                        {products.filter(p => 
                                            p.title.toLowerCase().includes(posSearch.toLowerCase()) || 
                                            p.sku.toLowerCase().includes(posSearch.toLowerCase()) ||
                                            (p.barcode && p.barcode.includes(posSearch))
                                        ).map(p => (
                                            <div key={p.id} onClick={() => addToPosCart(p)} style={{border:'1px solid #eee', borderRadius:'8px', padding:'10px', cursor:'pointer', position:'relative', transition:'transform 0.1s', ':active':{transform:'scale(0.98)'}}}>
                                                <div style={{height:'100px', background:'#f5f5f5', borderRadius:'4px', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                    {p.images && p.images[0] ? <img src={p.images[0]} style={{width:'80%', height:'80%', objectFit:'contain'}} alt=""/> : <Package size={30} color="#ccc"/>}
                                                </div>
                                                <div style={{fontSize:'13px', fontWeight:'600', marginBottom:'5px', height:'36px', overflow:'hidden'}}>{p.title}</div>
                                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                     <div style={{fontSize:'15px', color:'#166534', fontWeight:'bold'}}>${Number(p.price_base).toFixed(2)}</div>
                                                     <div style={{fontSize:'10px', background: p.stock > 0 ? '#dcfce7' : '#fee2e2', color: p.stock > 0 ? '#166534' : '#991b1b', padding:'2px 6px', borderRadius:'10px'}}>
                                                        Stock: {p.stock}
                                                     </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: TICKET */}
                        <div style={{background:'white', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', overflow:'hidden'}}>
                            {/* Client Header */}
                            <div style={{padding:'15px', background:'#f8f9fa', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <div style={{fontSize:'11px', color:'#666', fontWeight:'bold'}}>CLIENTE</div>
                                    <div style={{fontWeight:'bold'}}>{posClient.name}</div>
                                </div>
                                <button className="secondary-btn" style={{padding:'4px 8px'}}><Users size={14}/></button>
                            </div>

                            {/* Items List */}
                            <div style={{flex:1, overflowY:'auto', padding:'0'}}>
                                {posCart.length === 0 ? (
                                    <div style={{textAlign:'center', padding:'40px', color:'#bbb'}}>
                                        Carro Vacío
                                    </div>
                                ) : (
                                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                                        <thead style={{background:'#fff', position:'sticky', top:0}}>
                                            <tr style={{borderBottom:'1px solid #eee', color:'#888'}}>
                                                <th style={{padding:'10px 15px', textAlign:'left'}}>Cant.</th>
                                                <th style={{padding:'10px 15px', textAlign:'left'}}>Producto</th>
                                                <th style={{padding:'10px 15px', textAlign:'right'}}>Total</th>
                                                <th style={{width:'30px'}}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {posCart.map(item => (
                                                <tr key={item.id} style={{borderBottom:'1px solid #f5f5f5'}}>
                                                    <td style={{padding:'10px 15px'}}>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value={item.qty} 
                                                            onChange={e => updatePosQty(item.id, parseInt(e.target.value))}
                                                            style={{width:'40px', padding:'4px', textAlign:'center', border:'1px solid #ddd', borderRadius:'4px'}} 
                                                        />
                                                    </td>
                                                    <td style={{padding:'10px 15px'}}>
                                                        <div style={{fontWeight:'500'}}>{item.title}</div>
                                                        <div style={{fontSize:'11px', color:'#666'}}>${Number(item.price_base).toFixed(2)} c/u</div>
                                                    </td>
                                                    <td style={{padding:'10px 15px', textAlign:'right', fontWeight:'bold'}}>
                                                        ${(item.qty * item.price_base).toFixed(2)}
                                                    </td>
                                                    <td style={{padding:'0 10px'}}>
                                                        <button onClick={() => removeFromPosCart(item.id)} style={{border:'none', background:'none', color:'#ccc', cursor:'pointer', padding:'2px'}}>×</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Totals Footer */}
                            <div style={{padding:'20px', background:'#f8f9fa', borderTop:'1px solid #eee'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'14px', color:'#666'}}>
                                    <span>Subtotal:</span>
                                    <span>${(posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0) / 1.16).toFixed(2)}</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', fontSize:'14px', color:'#666'}}>
                                    <span>IVA (16%):</span>
                                    <span>${(posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0) - (posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0) / 1.16)).toFixed(2)}</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'24px', fontWeight:'bold', color:'#333'}}>
                                    <span>Total:</span>
                                    <span>${posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0).toFixed(2)}</span>
                                </div>

                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    <button onClick={() => handlePosCheckout('cash')} className="primary-btn" style={{background:'#166534', justifyContent:'center', fontSize:'14px', height:'45px'}}>
                                        <Banknote size={18} style={{marginRight:'8px'}}/> EFE
                                    </button>
                                    <button onClick={() => handlePosCheckout('card')} className="primary-btn" style={{background:'#0369a1', justifyContent:'center', fontSize:'14px', height:'45px'}}>
                                        <CreditCard size={18} style={{marginRight:'8px'}}/> TAR
                                    </button>
                                </div>
                            </div>
                        </div>
                     </div>
                 )}

                 {/* --- CLIENTS --- */}
                 {activeTab === 'clients' && (
                     <div style={{textAlign:'center', padding:'50px', color:'#888'}}>
                        <Users size={48} style={{marginBottom:'20px', opacity:0.3}} />
                        <h2>Base de Datos de Clientes</h2>
                        <p>Gestión de cuentas corrientes, límites de crédito y fidelización.</p>
                        <p style={{fontSize:'12px'}}>(Funcionalidad en desarrollo)</p>
                     </div>
                 )}
                 
                 {/* --- SUPPLIERS --- */}
                 {activeTab === 'suppliers' && (
                     <div style={{textAlign:'center', padding:'50px', color:'#888'}}>
                        <Truck size={48} style={{marginBottom:'20px', opacity:0.3}} />
                        <h2>Gestión de Proveedores</h2>
                        <p>Órdenes de compra, recepción de mercadería y cuentas a pagar.</p>
                        <p style={{fontSize:'12px'}}>(Funcionalidad en desarrollo)</p>
                     </div>
                 )}
                 
                 {/* --- CASH --- */}
                 {activeTab === 'cash' && (
                     <div style={{textAlign:'center', padding:'50px', color:'#888'}}>
                        <Banknote size={48} style={{marginBottom:'20px', opacity:0.3}} />
                        <h2>Control de Caja</h2>
                        <p>Apertura, cierre, retiros, gastos y movimientos de fondos.</p>
                        <p style={{fontSize:'12px'}}>(Funcionalidad en desarrollo)</p>
                     </div>
                 )}

                 {/* --- REPORTS --- */}
                 {activeTab === 'reports' && (
                     <div style={{textAlign:'center', padding:'50px', color:'#888'}}>
                        <BarChart3 size={48} style={{marginBottom:'20px', opacity:0.3}} />
                        <h2>Reportes y Estadísticas</h2>
                        <p>Ventas por rubro, ranking de vendedores, reportes fiscales (IVA).</p>
                        <p style={{fontSize:'12px'}}>(Funcionalidad en desarrollo)</p>
                     </div>
                 )}
                 
                 {/* --- SETTINGS --- */}
                 {activeTab === 'settings' && (
                     <div style={{padding:'20px'}}>
                        <h2>Configuración del Sistema</h2>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px', marginTop:'20px'}}>
                             <button className="secondary-btn" onClick={() => setActiveTab('users')} style={{height:'100px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                                <Users size={24} />
                                Usuarios y Permisos
                             </button>
                             {/* ... Otros ajustes ... */}
                        </div>
                        
                        {/* Legacy CMS/Marketing Access */}
                         <h3 style={{marginTop:'40px', borderTop:'1px solid #eee', paddingTop:'20px'}}>Módulos Web</h3>
                         <div style={{display:'flex', gap:'10px'}}>
                            <button className="secondary-btn" onClick={() => setActiveTab('marketing')}>Marketing Web</button>
                            <button className="secondary-btn" onClick={() => setActiveTab('cms')}>CMS / Páginas</button>
                         </div>
                     </div>
                 )}

                {/* --- MARKETING VIEW (Moved to legacy access) --- */}
                {activeTab === 'marketing' && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom:'50px'}}>
                    
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h2>Gestión de Marketing</h2>
                        <button className="secondary-btn" onClick={fetchMarketing}>↻ Refrescar</button>
                    </div>

                    {/* HERO BANNER BLOCK */}
                    <div className="card" style={{background:'white', padding:'20px', borderRadius:'8px', border:'1px solid #ddd'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h3>Hero Banner (Principal)</h3>
                            <button className="primary-btn" onClick={() => {
                                const hero = campaigns.find(c => c.slug === 'home_hero_banner') || { slug: 'home_hero_banner', content: { subtitle: 'Compra ahora y paga después' }, title: 'SOMOS ORGULLOSOS PROVEEDORES', image_url: '' };
                                handleEditCampaign(hero);
                            }}>Editar Banner</button>
                        </div>
                        <div style={{marginTop:'15px', padding:'15px', background:'#f8f9fa', borderRadius:'6px'}}>
                            {(() => {
                                const hero = campaigns.find(c => c.slug === 'home_hero_banner');
                                if (!hero) return <div style={{color:'#999'}}>No configurado (Se usará el por defecto)</div>;
                                return (
                                    <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                                        <img src={hero.image_url} style={{width:'150px', height:'80px', objectFit:'cover', borderRadius:'4px', background:'#ddd'}} />
                                        <div>
                                            <strong>{hero.title}</strong>
                                            <div style={{fontSize:'12px', color:'#666'}}>{hero.content?.subtitle}</div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>

                    {/* PROMOTIONS GRID BLOCK */}
                    <div className="card" style={{background:'white', padding:'20px', borderRadius:'8px', border:'1px solid #ddd'}}>
                         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h3>Grid de Promociones (Home)</h3>
                            <button className="primary-btn" onClick={() => {
                                const promo = campaigns.find(c => c.slug === 'home_promotions') || { slug: 'home_promotions', content: [], title: 'Promociones Home' };
                                handleEditCampaign(promo);
                            }}>Editar Promociones</button>
                        </div>
                        <div style={{marginTop:'15px', display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px'}}>
                             {(() => {
                                 const promoBlock = campaigns.find(c => c.slug === 'home_promotions');
                                 const list = Array.isArray(promoBlock?.content) ? promoBlock.content : [];
                                 if (list.length === 0) return <div style={{color:'#999'}}>No hay promociones activas</div>;
                                 return list.map((p, i) => (
                                     <div key={i} style={{minWidth:'120px', border:'1px solid #eee', borderRadius:'6px', padding:'10px', textAlign:'center'}}>
                                         <img src={p.image} style={{width:'100%', height:'80px', objectFit:'contain', marginBottom:'5px'}} />
                                         <div style={{fontSize:'12px', fontWeight:'bold'}}>{p.title}</div>
                                         <div style={{fontSize:'10px', background:'#f96302', color:'white', borderRadius:'4px', display:'inline-block', padding:'2px 5px'}}>{p.tag}</div>
                                     </div>
                                 ));
                             })()}
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
                            <div style={{background:'white', padding:'30px', borderRadius:'8px', width:'600px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
                                <h3 style={{marginTop:0, marginBottom:'20px'}}>Editar: {marketingFormData.slug}</h3>
                                <form onSubmit={handleMarketingSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                    
                                    <div style={formGroup}>
                                        <label style={labelStyle}>Título (Interno/Visible)</label>
                                        <input value={marketingFormData.title || ''} onChange={e=>setMarketingFormData({...marketingFormData, title:e.target.value})} style={inputStyle} />
                                    </div>

                                    {/* HERO SPECIFIC */}
                                    {marketingFormData.slug === 'home_hero_banner' && (
                                    <>
                                        <div style={formGroup}>
                                            <label style={labelStyle}>Imagen de Fondo</label>
                                            <div style={{display:'flex', gap:'5px'}}>
                                                <input value={marketingFormData.image_url || ''} onChange={e=>setMarketingFormData({...marketingFormData, image_url:e.target.value})} style={{...inputStyle, flex:1}} />
                                                <label className="secondary-btn" style={{padding:'8px', cursor:'pointer', fontSize:'12px'}}>
                                                    Subir
                                                    <input type="file" style={{display:'none'}} accept="image/*" onChange={async(e)=>{
                                                        const f = e.target.files[0];
                                                        if(!f) return;
                                                        const d = new FormData(); d.append('image', f);
                                                        try {
                                                            const res = await axios.post('/api/upload', d, {headers:{'Content-Type':'multipart/form-data'}});
                                                            setMarketingFormData({...marketingFormData, image_url: `http://localhost:5000${res.data.url}`});
                                                        } catch(er){alert('Error subiendo');}
                                                    }}/>
                                                </label>
                                            </div>
                                        </div>
                                        <div style={formGroup}>
                                            <label style={labelStyle}>Subtítulo</label>
                                            <input value={marketingFormData.content?.subtitle || ''} onChange={e=>setMarketingFormData({...marketingFormData, content: {...marketingFormData.content, subtitle: e.target.value}})} style={inputStyle} />
                                        </div>
                                    </>
                                    )}

                                    {/* PROMOTIONS SPECIFIC */}
                                    {marketingFormData.slug === 'home_promotions' && (
                                        <div style={{border:'1px solid #eee', padding:'10px', borderRadius:'6px'}}>
                                            <h4 style={{margin:'0 0 10px'}}>Lista de Promociones</h4>
                                            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                                                {(Array.isArray(marketingFormData.content) ? marketingFormData.content : []).map((item, idx) => (
                                                    <div key={idx} style={{display:'flex', gap:'10px', alignItems:'center', background:'#f9f9f9', padding:'5px', border:'1px solid #eee'}}>
                                                        <div style={{width:'50px', height:'50px'}}>
                                                            <img src={item.image} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                                        </div>
                                                        <div style={{flex:1, display:'flex', flexDirection:'column', gap:'5px'}}>
                                                            <input 
                                                                placeholder="Título"
                                                                value={item.title} 
                                                                onChange={e => {
                                                                    const newList = [...marketingFormData.content];
                                                                    newList[idx] = { ...newList[idx], title: e.target.value };
                                                                    setMarketingFormData({...marketingFormData, content: newList});
                                                                }}
                                                                style={{...inputStyle, padding:'4px', fontSize:'12px'}}
                                                            />
                                                            <div style={{display:'flex', gap:'5px'}}>
                                                                <input 
                                                                    placeholder="Tag"
                                                                    value={item.tag} 
                                                                    onChange={e => {
                                                                        const newList = [...marketingFormData.content];
                                                                        newList[idx] = { ...newList[idx], tag: e.target.value };
                                                                        setMarketingFormData({...marketingFormData, content: newList});
                                                                    }}
                                                                    style={{...inputStyle, padding:'4px', fontSize:'12px', width:'80px'}}
                                                                />
                                                                <input 
                                                                    placeholder="URL Img"
                                                                    value={item.image} 
                                                                    onChange={e => {
                                                                        const newList = [...marketingFormData.content];
                                                                        newList[idx] = { ...newList[idx], image: e.target.value };
                                                                        setMarketingFormData({...marketingFormData, content: newList});
                                                                    }}
                                                                    style={{...inputStyle, padding:'4px', fontSize:'12px', flex:1}}
                                                                />
                                                                 {/* Item Upload */}
                                                                <label className="secondary-btn" style={{padding:'4px', cursor:'pointer', fontSize:'10px'}}>
                                                                    IMG
                                                                    <input type="file" style={{display:'none'}} accept="image/*" onChange={async(e)=>{
                                                                        const f = e.target.files[0];
                                                                        if(!f) return;
                                                                        const d = new FormData(); d.append('image', f);
                                                                        try {
                                                                            const res = await axios.post('/api/upload', d, {headers:{'Content-Type':'multipart/form-data'}});
                                                                            const url = `http://localhost:5000${res.data.url}`;
                                                                            const newList = [...marketingFormData.content];
                                                                            newList[idx] = { ...newList[idx], image: url };
                                                                            setMarketingFormData({...marketingFormData, content: newList});
                                                                        } catch(er){alert('Error');}
                                                                    }}/>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => {
                                                             const newList = [...marketingFormData.content];
                                                             newList.splice(idx, 1);
                                                             setMarketingFormData({...marketingFormData, content: newList});
                                                        }} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>×</button>
                                                    </div>
                                                ))}
                                                <button type="button" className="secondary-btn" onClick={() => {
                                                    const newList = [...(Array.isArray(marketingFormData.content) ? marketingFormData.content : [])];
                                                    newList.push({ title: 'Nueva Promo', tag: 'Oferta', image: 'https://via.placeholder.com/150' });
                                                    setMarketingFormData({...marketingFormData, content: newList});
                                                }}>+ Agregar Promoción</button>
                                            </div>
                                        </div>
                                    )}

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


            {/* --- PROMOTIONS (PROMO CARDS) VIEW --- */}
            {activeTab === 'promotions' && (
                <div style={{gap: '30px', display:'flex', flexDirection:'column'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h2>Gestión de Ofertas y Promociones</h2>
                         <div style={{display:'flex', gap:'10px'}}>
                            <button className={`secondary-btn ${activePromoTab === 'list' ? 'active' : ''}`} onClick={() => setActivePromoTab('list')}>Tarjetas Grid</button>
                            <button className={`secondary-btn ${activePromoTab === 'banner' ? 'active' : ''}`} onClick={() => setActivePromoTab('banner')}>Banner Principal</button>
                        </div>
                    </div>

                    {activePromoTab === 'banner' && (
                        <div style={{background:'white', padding:'30px', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                            <h3>Banner Principal de Liquidación</h3>
                            <p style={{color:'#666', marginBottom:'20px'}}>Este banner aparece en grande en la página de Promociones.</p>
                            <form onSubmit={handleSavePromoBanner} style={{display:'grid', gap:'20px', maxWidth:'600px'}}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Título Principal</label>
                                    <input value={promoBanner.title || ''} onChange={e => setPromoBanner({...promoBanner, title: e.target.value})} style={inputStyle} placeholder="ej. GRAN LIQUIDACIÓN" />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Subtítulo / Contenido</label>
                                    <textarea value={promoBanner.content || ''} onChange={e => setPromoBanner({...promoBanner, content: e.target.value})} style={{...inputStyle, height:'80px'}} placeholder="ej. Hasta 40% de descuento..." />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Imagen de Fondo (URL)</label>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <input value={promoBanner.image_url || ''} onChange={e => setPromoBanner({...promoBanner, image_url: e.target.value})} style={{...inputStyle, flex:1}} placeholder="http://..." />
                                        <label className="secondary-btn" style={{padding:'10px', cursor:'pointer'}}>
                                            Subir
                                            <input type="file" style={{display:'none'}} accept="image/*" onChange={async (e) => {
                                                const f = e.target.files[0];
                                                if(!f) return;
                                                const d = new FormData(); d.append('image', f);
                                                try {
                                                    const res = await axios.post('/api/upload', d, {headers: {'Content-Type': 'multipart/form-data'}});
                                                    setPromoBanner({...promoBanner, image_url: `http://localhost:5000${res.data.url}`});
                                                } catch(err) { alert('Error subiendo imagen'); }
                                            }} />
                                        </label>
                                    </div>
                                    {promoBanner.image_url && <img src={promoBanner.image_url} style={{marginTop:'10px', height:'100px', objectFit:'cover', borderRadius:'6px'}} />}
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Enlace del Botón</label>
                                    <input value={promoBanner.target_link || ''} onChange={e => setPromoBanner({...promoBanner, target_link: e.target.value})} style={inputStyle} placeholder="ej. /?category=Pinturas" />
                                </div>
                                <div style={formGroup}>
                                    <button className="primary-btn">Guardar Banner</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activePromoTab === 'list' && (
                        <div style={{display:'grid', gridTemplateColumns:'1fr 350px', gap:'20px'}}>
                            
                            {/* List */}
                            <div style={{background:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                                <h3 style={{marginTop:0, marginBottom:'20px'}}>Tarjetas Activas</h3>
                                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'20px'}}>
                                    {promotions.map(p => (
                                        <div key={p.id} style={{border:'1px solid #eee', borderRadius:'8px', padding:'15px', position:'relative', background: p.is_active ? 'white' : '#f9f9f9'}}>
                                            <div style={{position:'absolute', top:'10px', right:'10px', display:'flex', gap:'5px'}}>
                                                <button onClick={() => handleEditPromo(p)} style={{background:'none', border:'none', cursor:'pointer', color:'#2563eb'}}><PenSquare size={16}/></button>
                                                <button onClick={() => handleDeletePromo(p.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#dc2626'}}><Trash2 size={16}/></button>
                                            </div>
                                            <span style={{background: p.badge_color, color:'white', fontSize:'10px', padding:'2px 6px', borderRadius:'10px', fontWeight:'bold'}}>{p.badge_text}</span>
                                            <h4 style={{margin:'5px 0', color: p.is_active ? '#333' : '#999'}}>{p.title}</h4>
                                            <p style={{fontSize:'12px', color:'#666', lineHeight:1.4}}>{p.description}</p>
                                            <div style={{fontSize:'10px', color:'#999', marginTop:'10px'}}>Link: {p.target_link}</div>
                                        </div>
                                    ))}
                                    {promotions.length === 0 && <p style={{color:'#999'}}>No hay promociones registradas.</p>}
                                </div>
                            </div>

                            {/* Form */}
                            <div style={{background:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', height:'fit-content'}}>
                                <h3 style={{marginTop:0}}>{editingPromo ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h3>
                                <form onSubmit={handleSavePromo} style={{display:'grid', gap:'15px'}}>
                                    <div>
                                        <label style={labelStyle}>Título</label>
                                        <input required value={promoFormData.title} onChange={e => setPromoFormData({...promoFormData, title: e.target.value})} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Descripción</label>
                                        <textarea required value={promoFormData.description} onChange={e => setPromoFormData({...promoFormData, description: e.target.value})} style={{...inputStyle, width:'100%', boxSizing:'border-box', height:'80px'}} />
                                    </div>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                        <div>
                                            <label style={labelStyle}>Badge Texto</label>
                                            <input value={promoFormData.badge_text} onChange={e => setPromoFormData({...promoFormData, badge_text: e.target.value})} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} placeholder="ej. -20%" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Badge Color</label>
                                            <input type="color" value={promoFormData.badge_color} onChange={e => setPromoFormData({...promoFormData, badge_color: e.target.value})} style={{...inputStyle, width:'100%', height:'42px', padding:'2px'}} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Link Destino</label>
                                        <input value={promoFormData.target_link} onChange={e => setPromoFormData({...promoFormData, target_link: e.target.value})} style={{...inputStyle, width:'100%', boxSizing:'border-box'}} placeholder="/?category=..." />
                                    </div>
                                    <div>
                                        <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                                            <input type="checkbox" checked={promoFormData.is_active} onChange={e => setPromoFormData({...promoFormData, is_active: e.target.checked})} />
                                            Activa
                                        </label>
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button className="primary-btn" style={{flex:1}}>Guardar</button>
                                        <button type="button" className="secondary-btn" onClick={() => {
                                            setEditingPromo(null);
                                            setPromoFormData({ title: '', description: '', target_link: '', badge_text: '', badge_color: '#f96302', display_order: 0, is_active: true });
                                        }} style={{flex:1}}>Cancelar</button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    )}
                </div>
            )}

            {/* --- PRO REQUESTS VIEW --- */}
            {activeTab === 'pro_requests' && (
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                         <h2>Solicitudes de Clientes PRO</h2>
                    </div>
                    {proRequests.length === 0 ? <p style={{color:'#666'}}>No hay solicitudes pendientes.</p> : (
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                <tr>
                                    <th style={{padding:'12px', textAlign:'left'}}>Fecha</th>
                                    <th style={{padding:'12px', textAlign:'left'}}>Nombre</th>
                                    <th style={{padding:'12px', textAlign:'left'}}>Empresa</th>
                                    <th style={{padding:'12px', textAlign:'left'}}>Email</th>
                                    <th style={{padding:'12px', textAlign:'left'}}>Teléfono</th>
                                    <th style={{padding:'12px', textAlign:'right'}}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proRequests.map(req => (
                                    <tr key={req.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                        <td style={{padding:'12px'}}>{new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}</td>
                                        <td style={{padding:'12px', fontWeight:'bold'}}>{req.full_name}</td>
                                        <td style={{padding:'12px'}}>{req.company_name || '-'}</td>
                                        <td style={{padding:'12px'}}>{req.email}</td>
                                        <td style={{padding:'12px'}}>{req.phone}</td>
                                        <td style={{padding:'12px', textAlign:'right'}}>
                                            <a href={`mailto:${req.email}`} className="secondary-btn" style={{textDecoration:'none', fontSize:'12px'}}>Responder</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

            
            {/* --- ORDERS VIEW --- */}
            {activeTab === 'orders' && (
                <div style={{display: 'flex', gap: '2rem'}}>
                    {/* List */}
                    <div style={{flex: 2, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                        <h2 style={{marginBottom: '20px'}}>Control de Pedidos</h2>
                        <div style={{overflowX: 'auto'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                                <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                    <tr>
                                        <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>ID</th>
                                        <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Cliente</th>
                                        <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Fecha</th>
                                        <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Total</th>
                                        <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Estado</th>
                                        <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id} style={{borderBottom:'1px solid #f1f5f9', background: selectedOrder?.id === o.id ? '#f0f9ff' : 'transparent'}}>
                                            <td style={{padding:'12px'}}>#{o.id}</td>
                                            <td style={{padding:'12px'}}>
                                                <div style={{fontWeight:'bold'}}>{o.customer_name}</div>
                                                <div style={{color:'#64748b', fontSize:'12px'}}>{o.customer_email}</div>
                                            </td>
                                            <td style={{padding:'12px'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                                            <td style={{padding:'12px', fontWeight:'bold'}}>${parseFloat(o.total).toLocaleString()}</td>
                                            <td style={{padding:'12px'}}>
                                                <span style={{
                                                    background: o.status === 'pending' ? '#fef3c7' : o.status === 'completed' ? '#dcfce7' : '#fee2e2',
                                                    color: o.status === 'pending' ? '#92400e' : o.status === 'completed' ? '#166534' : '#991b1b',
                                                    padding: '4px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'bold'
                                                }}>
                                                    {o.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{padding:'12px'}}>
                                                <button onClick={() => handleViewOrder(o.id)} style={{background:'#0ea5e9', color:'white', border:'none', padding:'6px 10px', borderRadius:'4px', cursor:'pointer'}}>Ver Detalle</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail Panel */}
                    <div style={{flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content'}}>
                        {selectedOrder ? (
                            <>
                                <h3 style={{marginTop:0, borderBottom:'1px solid #eee', paddingBottom:'10px'}}>Detalle Orden #{selectedOrder.id}</h3>
                                
                                <div style={{marginBottom:'20px'}}>
                                    <label style={{display:'block', color:'#666', fontSize:'12px'}}>Estado del Pedido:</label>
                                    <select 
                                        value={selectedOrder.status}
                                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                        style={{width:'100%', padding:'8px', marginTop:'5px', borderRadius:'4px', border:'1px solid #ddd'}}
                                    >
                                        <option value="pending">Pendiente de Pago</option>
                                        <option value="paid">Pagado</option>
                                        <option value="processing">En Proceso (Almacén)</option>
                                        <option value="shipped">Enviado</option>
                                        <option value="completed">Entregado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>

                                <div style={{background:'#f8fafc', padding:'15px', borderRadius:'6px', marginBottom:'20px'}}>
                                    <h4 style={{margin:'0 0 10px 0', fontSize:'14px', color:'#475569'}}>Datos de Envío</h4>
                                    <p style={{margin:0, fontSize:'14px'}}><strong>{selectedOrder.customer_name}</strong></p>
                                    <p style={{margin:0, fontSize:'13px', color:'#666'}}>{selectedOrder.shipping_address}</p>
                                    <p style={{margin:0, fontSize:'13px', color:'#666'}}>{selectedOrder.shipping_city}, {selectedOrder.shipping_zip}</p>
                                    <p style={{margin:0, fontSize:'13px', color:'#666'}}>{selectedOrder.customer_email}</p>
                                </div>

                                <h4 style={{fontSize:'14px', color:'#475569'}}>Productos ({selectedOrder.items?.length || 0})</h4>
                                <div style={{display:'flex', flexDirection:'column', gap:'10px', maxHeight:'400px', overflowY:'auto'}}>
                                    {selectedOrder.items?.map(item => (
                                        <div key={item.id} style={{display:'flex', gap:'10px', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                                            <img src={item.images && item.images[0] ? item.images[0] : 'https://placehold.co/50'} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} />
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'13px', fontWeight:'bold'}}>{item.title}</div>
                                                <div style={{fontSize:'12px', color:'#666'}}>SKU: {item.sku}</div>
                                                <div style={{fontSize:'12px'}}>Cant: {item.quantity} x ${item.unit_price}</div>
                                            </div>
                                            <div style={{fontWeight:'bold'}}>${item.subtotal}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{borderTop:'2px solid #eee', marginTop:'20px', paddingTop:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span style={{fontSize:'16px'}}>Total:</span>
                                    <span style={{fontSize:'20px', fontWeight:'bold', color:'#166534'}}>${parseFloat(selectedOrder.total).toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div style={{textAlign:'center', color:'#999', padding:'40px'}}>
                                <p>Selecciona una orden para ver los detalles completos y gestionar su estado.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* --- CLIENTS VIEW --- */}
            {activeTab === 'clients' && (
                 <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                         <h2>Gestión de Clientes</h2>
                         <button onClick={() => openClientModal()} className="btn-primary" style={{display:'flex', gap:'5px', alignItems:'center'}}>
                            <Plus size={16}/> Nuevo Cliente
                         </button>
                    </div>

                    <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                        <div style={{position:'relative', flex:1}}>
                            <Search size={18} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre, RFC, email..." 
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchClients()}
                                style={{width:'100%', padding:'10px 10px 10px 35px', borderRadius:'6px', border:'1px solid #cbd5e1'}}
                            />
                        </div>
                        <button onClick={fetchClients} className="btn-secondary">Buscar</button>
                    </div>
                    
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                <tr>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>ID</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Cliente</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Contacto</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Ubicación</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Crédito</th>
                                    <th style={{textAlign:'right', padding:'12px', color:'#64748b'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(c => (
                                    <tr key={c.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                        <td style={{padding:'12px'}}>{c.id}</td>
                                        <td style={{padding:'12px'}}>
                                            <div style={{fontWeight:'bold'}}>{c.full_name}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>RFC: {c.rfc || 'N/A'}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <div>{c.email}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{c.phone}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <div>{c.city}, {c.state}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{c.colonia}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <div>Lim: ${parseFloat(c.credit_limit || 0).toFixed(2)}</div>
                                            <div style={{color: (c.current_debt || 0) > 0 ? 'red' : 'green', fontSize:'12px'}}>
                                                Deuda: ${parseFloat(c.current_debt || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={{padding:'12px', textAlign:'right'}}>
                                            <button onClick={() => openClientModal(c)} style={{marginRight:'5px', color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}><PenSquare size={16}/></button>
                                            <button onClick={() => handleDeleteClient(c.id)} style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}
            
            {/* --- CLIENT MODAL --- */}
            {activeTab === 'clients' && editingClient && (
                <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', width:'600px', maxWidth:'90%', borderRadius:'8px', padding:'20px', maxHeight:'90vh', overflowY:'auto'}}>
                        <h2 style={{marginBottom:'20px'}}>{editingClient.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        <form onSubmit={handleSaveClient}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Nombre Completo / Razón Social *</label>
                                    <input required type="text" value={clientForm.full_name || ''} onChange={e => setClientForm({...clientForm, full_name: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>RFC</label>
                                    <input type="text" value={clientForm.rfc || ''} onChange={e => setClientForm({...clientForm, rfc: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Teléfono</label>
                                    <input type="text" value={clientForm.phone || ''} onChange={e => setClientForm({...clientForm, phone: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Email</label>
                                    <input type="email" value={clientForm.email || ''} onChange={e => setClientForm({...clientForm, email: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Dirección (Calle y Número)</label>
                                    <input type="text" value={clientForm.address || ''} onChange={e => setClientForm({...clientForm, address: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Colonia</label>
                                    <input type="text" value={clientForm.colonia || ''} onChange={e => setClientForm({...clientForm, colonia: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Ciudad</label>
                                    <input type="text" value={clientForm.city || ''} onChange={e => setClientForm({...clientForm, city: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Límite de Crédito</label>
                                    <input type="number" value={clientForm.credit_limit || 0} onChange={e => setClientForm({...clientForm, credit_limit: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Notas</label>
                                    <textarea value={clientForm.notes || ''} onChange={e => setClientForm({...clientForm, notes: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}}></textarea>
                                </div>
                            </div>
                            <div style={{marginTop:'20px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                <button type="button" onClick={() => setEditingClient(null)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar Cliente</button>
                            </div>
                        </form>
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

            {/* --- CASH VIEW --- */}
            {activeTab === 'cash' && (
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <h2 style={{marginBottom: '20px'}}>Control de Caja</h2>
                    
                    {!cashStatus.isOpen ? (
                        <div style={{maxWidth:'500px', margin:'50px auto', padding:'30px', border:'1px solid #ddd', borderRadius:'10px', textAlign:'center'}}>
                            <h3>Caja Cerrada</h3>
                            <p style={{color:'#666', marginBottom:'20px'}}>Inicia turno para registrar ventas y gastos.</p>
                            <form onSubmit={handleOpenRegister}>
                                <div style={{textAlign:'left', marginBottom:'15px'}}>
                                    <label>Monto Inicial (Fondo de Caja)</label>
                                    <div style={{position:'relative'}}>
                                        <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)'}}>$</span>
                                        <input required name="amount" type="number" step="0.01" style={{width:'100%', padding:'10px 10px 10px 25px', borderRadius:'6px', border:'1px solid #cbd5e1'}} />
                                    </div>
                                </div>
                                <div style={{textAlign:'left', marginBottom:'15px'}}>
                                    <label>Notas de Apertura</label>
                                    <textarea name="notes" placeholder="Ej. Turno matutino, fondo revisado..." style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #cbd5e1'}}></textarea>
                                </div>
                                <button className="btn-primary" style={{width:'100%', justifyContent:'center'}}>ABRIR CAJA</button>
                            </form>
                        </div>
                    ) : (
                        <div>
                             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', marginBottom:'30px'}}>
                                <div style={{background:'#f0fdf4', padding:'20px', borderRadius:'8px', borderLeft:'5px solid #22c55e'}}>
                                    <div style={{color:'#166534', fontWeight:'bold', fontSize:'14px'}}>BALANCE ACTUAL</div>
                                    <div style={{fontSize:'32px', fontWeight:'900', color:'#14532d'}}>${parseFloat(cashStatus.currentBalance).toFixed(2)}</div>
                                </div>
                                
                                <button 
                                    onClick={() => { const amt = prompt("Monto a Retirar:"); const desc = prompt("Concepto:"); if(amt && desc) handleCashMovement('expense', amt, desc); }}
                                    style={{background:'#fef2f2', border:'2px dashed #ef4444', borderRadius:'8px', color:'#991b1b', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}
                                >
                                    - REGISTRAR GASTO / RETIRO
                                </button>
                                
                                <button 
                                    onClick={() => { const amt = prompt("Monto a Ingresar:"); const desc = prompt("Concepto:"); if(amt && desc) handleCashMovement('deposit', amt, desc); }}
                                    style={{background:'#f0f9ff', border:'2px dashed #0ea5e9', borderRadius:'8px', color:'#075985', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}
                                >
                                    + INGRESAR DINERO EXTRA
                                </button>
                             </div>

                             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                                 <h3>Movimientos del Turno</h3>
                                 <form onSubmit={handleCloseRegister} style={{display:'flex', gap:'10px', background:'#f8fafc', padding:'10px', borderRadius:'6px', border:'1px solid #e2e8f0'}}>
                                     <div style={{display:'flex', flexDirection:'column'}}>
                                        <label style={{fontSize:'10px', fontWeight:'bold', color:'#64748b'}}>TOTAL EN CAJA (CONTADO)</label>
                                        <input required name="closing_amount" type="number" step="0.01" placeholder="$ 0.00" style={{padding:'5px', width:'120px', border:'1px solid #cbd5e1', borderRadius:'4px'}} />
                                     </div>
                                     <div style={{display:'flex', flexDirection:'column'}}>
                                        <label style={{fontSize:'10px', fontWeight:'bold', color:'#64748b'}}>OBSERVACIONES</label>
                                        <input name="notes" placeholder="..." style={{padding:'5px', width:'200px', border:'1px solid #cbd5e1', borderRadius:'4px'}} />
                                     </div>
                                     <button style={{background:'#0f172a', color:'white', border:'none', padding:'0 20px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>CORTE Z (CERRAR)</button>
                                 </form>
                             </div>

                             <div style={{maxHeight:'400px', overflowY:'auto', border:'1px solid #e2e8f0', borderRadius:'6px'}}>
                                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                                    <thead style={{position:'sticky', top:0, zIndex:1}}>
                                        <tr style={{background:'#f8fafc', borderBottom:'2px solid #e2e8f0'}}>
                                            <th style={{padding:'10px', textAlign:'left'}}>Hora</th>
                                            <th style={{padding:'10px', textAlign:'left'}}>Tipo</th>
                                            <th style={{padding:'10px', textAlign:'left'}}>Concepto</th>
                                            <th style={{padding:'10px', textAlign:'right'}}>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cashStatus.movements.map(m => (
                                            <tr key={m.id} style={{borderBottom:'1px solid #eee'}}>
                                                <td style={{padding:'10px'}}>{new Date(m.created_at).toLocaleTimeString()}</td>
                                                <td style={{padding:'10px'}}>
                                                    <span style={{
                                                        padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold',
                                                        background: ['deposit','sale','opening'].includes(m.type) ? '#dcfce7' : '#fee2e2',
                                                        color: ['deposit','sale','opening'].includes(m.type) ? '#166534' : '#991b1b'
                                                    }}>
                                                        {m.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{padding:'10px'}}>{m.description}</td>
                                                <td style={{padding:'10px', textAlign:'right', fontWeight:'bold', color: ['deposit','sale','opening'].includes(m.type) ? '#166534' : '#991b1b'}}>
                                                    {['deposit','sale','opening'].includes(m.type) ? '+' : '-'} ${parseFloat(m.amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- SUPPLIERS VIEW --- */}
            {activeTab === 'suppliers' && (
                <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                         <h2>Catálogo de Proveedores</h2>
                         <button onClick={() => openSupplierModal()} className="btn-primary" style={{display:'flex', gap:'5px', alignItems:'center'}}>
                            <Plus size={16}/> Nuevo Proveedor
                         </button>
                    </div>

                     <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                        <div style={{position:'relative', flex:1}}>
                            <Search size={18} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
                            <input 
                                type="text" 
                                placeholder="Buscar por empresa, contacto, RFC..." 
                                value={supplierSearch}
                                onChange={(e) => setSupplierSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchSuppliers()}
                                style={{width:'100%', padding:'10px 10px 10px 35px', borderRadius:'6px', border:'1px solid #cbd5e1'}}
                            />
                        </div>
                        <button onClick={fetchSuppliers} className="btn-secondary">Buscar</button>
                    </div>

                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                <tr>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Empresa</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Contacto Principal</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Datos Fiscales</th>
                                    <th style={{textAlign:'left', padding:'12px', color:'#64748b'}}>Condiciones</th>
                                    <th style={{textAlign:'right', padding:'12px', color:'#64748b'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map(s => (
                                    <tr key={s.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                        <td style={{padding:'12px'}}>
                                            <div style={{fontWeight:'bold'}}>{s.company_name}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{s.website || '-'}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <div style={{fontWeight:'bold'}}>{s.contact_name}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{s.email}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{s.phone}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <div>{s.rfc || 'S/N'}</div>
                                            <div style={{color:'#64748b', fontSize:'12px'}}>{s.city}, {s.state}</div>
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            <span style={{background:'#f0fdf4', color:'#15803d', padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}}>Crédito: {s.credit_days} días</span>
                                            <div style={{marginTop:'5px', fontSize:'12px', color:'#666'}}>Entrega: {s.delivery_days} días</div>
                                        </td>
                                        <td style={{padding:'12px', textAlign:'right'}}>
                                             <button onClick={() => openSupplierModal(s)} style={{marginRight:'5px', color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}><PenSquare size={16}/></button>
                                            <button onClick={() => handleDeleteSupplier(s.id)} style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- SUPPLIER MODAL --- */}
            {activeTab === 'suppliers' && editingSupplier && (
                <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', width:'700px', maxWidth:'90%', borderRadius:'8px', padding:'20px', maxHeight:'90vh', overflowY:'auto'}}>
                        <h2 style={{marginBottom:'20px'}}>{editingSupplier.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                        <form onSubmit={handleSaveSupplier}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Razón Social / Empresa *</label>
                                    <input required type="text" value={supplierForm.company_name || ''} onChange={e => setSupplierForm({...supplierForm, company_name: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Nombre de Contacto</label>
                                    <input type="text" value={supplierForm.contact_name || ''} onChange={e => setSupplierForm({...supplierForm, contact_name: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>RFC</label>
                                    <input type="text" value={supplierForm.rfc || ''} onChange={e => setSupplierForm({...supplierForm, rfc: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input type="email" value={supplierForm.email || ''} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Teléfono</label>
                                    <input type="text" value={supplierForm.phone || ''} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Dirección</label>
                                    <input type="text" value={supplierForm.address || ''} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Ciudad</label>
                                    <input type="text" value={supplierForm.city || ''} onChange={e => setSupplierForm({...supplierForm, city: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Sitio Web</label>
                                    <input type="text" value={supplierForm.website || ''} onChange={e => setSupplierForm({...supplierForm, website: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Días de Crédito</label>
                                    <input type="number" value={supplierForm.credit_days || 0} onChange={e => setSupplierForm({...supplierForm, credit_days: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label>Tiempo de Entrega (Días)</label>
                                    <input type="number" value={supplierForm.delivery_days || 0} onChange={e => setSupplierForm({...supplierForm, delivery_days: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
                                </div>
                                <div style={{gridColumn:'1/-1'}}>
                                    <label>Notas</label>
                                    <textarea value={supplierForm.notes || ''} onChange={e => setSupplierForm({...supplierForm, notes: e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #cbd5e1'}}></textarea>
                                </div>
                            </div>
                            <div style={{marginTop:'20px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                <button type="button" onClick={() => setEditingSupplier(null)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar Proveedor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* --- PRODUCTS VIEW (RENAMED TO INVENTORY) --- */}
            {activeTab === 'inventory' && (
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
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', marginBottom:'20px', paddingBottom:'10px'}}>
                        <h3 style={{margin:0}}>{editingProduct ? 'Editar Artículo' : 'Nuevo Articulo'}</h3>
                        <div style={{display:'flex', gap:'5px', background:'#f5f5f5', padding:'4px', borderRadius:'6px'}}>
                            {['general', 'pricing', 'stock'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={(e) => { e.preventDefault(); setActiveFormTab(tab); }}
                                    style={{
                                        border:'none', padding:'6px 12px', borderRadius:'4px', fontSize:'13px', cursor:'pointer', textTransform:'capitalize', fontWeight:'bold',
                                        background: activeFormTab === tab ? 'white' : 'transparent',
                                        boxShadow: activeFormTab === tab ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                        color: activeFormTab === tab ? '#333' : '#888'
                                    }}
                                >
                                    {tab === 'general' ? 'Datos Generales' : tab === 'pricing' ? 'Precios y Costos' : 'Inventario'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        
                        {/* --- TAB: GENERAL --- */}
                        {activeFormTab === 'general' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Código (SKU)</label>
                                    <input placeholder="Ej. FER-001" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Código de Barras (EAN13)</label>
                                    <input placeholder="Escanee código..." value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={{...formGroup, gridColumn: '1/-1'}}>
                                    <label style={labelStyle}>Descripción / Nombre del Artículo</label>
                                    <input placeholder="Nombre completo" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Rubro / Categoría</label>
                                    <input 
                                        list="rubro-options" 
                                        placeholder="Seleccionar..." 
                                        value={formData.rubro} 
                                        onChange={e => setFormData({...formData, rubro: e.target.value, category: e.target.value})} // Sync with legacy category
                                        style={inputStyle} 
                                    />
                                    <datalist id="rubro-options">
                                        <option value="Herramientas Manuales" />
                                        <option value="Herramientas Eléctricas" />
                                        <option value="Plomería" />
                                        <option value="Electricidad" />
                                        <option value="Pinturas" />
                                        <option value="Tornillería" />
                                        <option value="Jardinería" />
                                    </datalist>
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Marca</label>
                                    <input placeholder="Ej. Truper, Makita" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Imagen del Producto</label>
                                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                         <input 
                                            type="text" 
                                            placeholder="URL o subir archivo..." 
                                            value={formData.image} 
                                            onChange={e => setFormData({...formData, image: e.target.value})} 
                                            style={{...inputStyle, flex:1}} 
                                        />
                                        <label className="btn-secondary" style={{cursor:'pointer', padding:'8px 15px', borderRadius:'4px', border:'1px solid #ddd', background:'#f8fafc'}}>
                                            Subir
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                style={{display:'none'}} 
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if(!file) return;
                                                    const data = new FormData();
                                                    data.append('image', file);
                                                    try {
                                                        const res = await axios.post('/api/upload', data, { headers: {'Content-Type': 'multipart/form-data'} });
                                                        setFormData({...formData, image: `http://localhost:5000${res.data.url}`}); // Assuming local dev
                                                        alert('Imagen subida correctamente');
                                                    } catch(err) {
                                                        alert('Error subiendo imagen');
                                                        console.error(err);
                                                    }
                                                }} 
                                            />
                                        </label>
                                    </div>
                                    {formData.image && <img src={formData.image} alt="Preview" style={{height:'60px', marginTop:'10px', borderRadius:'4px', border:'1px solid #ddd'}} />}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: PRICING --- */}
                        {activeFormTab === 'pricing' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Costo Neto ($)</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>IVA (%)</label>
                                    <select value={formData.tax_rate} onChange={e => setFormData({...formData, tax_rate: e.target.value})} style={inputStyle}>
                                        <option value="16">16% (General)</option>
                                        <option value="8">8% (Frontera)</option>
                                        <option value="0">0% (Exento)</option>
                                    </select>
                                </div>
                                <div style={{display:'flex', flexDirection:'column', justifyContent:'center', fontSize:'12px', color:'#666'}}>
                                    <span>Costo + IVA: <strong>${(parseFloat(formData.cost_price||0) * (1 + parseFloat(formData.tax_rate||0)/100)).toFixed(2)}</strong></span>
                                </div>

                                <div style={{...formGroup, gridColumn: '1/-1', borderTop:'1px solid #eee', paddingTop:'20px', marginTop:'10px'}}>
                                    <label style={{...labelStyle, fontSize:'16px', color:'#166534'}}>Precio de Venta (Público)</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={formData.price_base} onChange={e => setFormData({...formData, price_base: e.target.value})} required style={{...inputStyle, fontSize:'18px', fontWeight:'bold', borderColor:'#166534'}} />
                                    <p style={{fontSize:'12px', color:'#666', marginTop:'5px'}}>
                                        Margen de Ganancia: <strong>{ formData.price_base > 0 ? (((formData.price_base - (formData.cost_price * (1 + formData.tax_rate/100))) / formData.price_base) * 100).toFixed(1) : 0 }%</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: STOCK (INVENTORY) --- */}
                        {activeFormTab === 'stock' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                 <div style={formGroup}>
                                    <label style={labelStyle}>Stock Actual</label>
                                    <input type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required style={{...inputStyle, background:'#f0fdf4'}} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Unidad de Medida</label>
                                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} style={inputStyle}>
                                        <option value="un">Unidad / Pieza</option>
                                        <option value="kg">Kilogramo</option>
                                        <option value="m">Metro</option>
                                        <option value="l">Litro</option>
                                        <option value="caja">Caja / Paquete</option>
                                    </select>
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Mínimo (Alerta)</label>
                                    <input type="number" placeholder="5" value={formData.stock_min} onChange={e => setFormData({...formData, stock_min: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Máximo (Ideal)</label>
                                    <input type="number" placeholder="100" value={formData.stock_max} onChange={e => setFormData({...formData, stock_max: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Ubicación Física</label>
                                    <input placeholder="Pasillo A, Estante 3..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Peso (kg)</label>
                                    <input type="number" step="0.001" placeholder="0.000" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} style={inputStyle} />
                                </div>
                            </div>
                        )}


                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '30px', borderTop:'1px solid #eee', paddingTop:'20px' }}>
                             <button type="submit" className="primary-btn" style={{ flex: 1 }}>{editingProduct ? 'Guardar Cambios' : 'Registrar Artículo'}</button>
                             <button type="button" onClick={() => setShowForm(false)} className="secondary-btn" style={{ flex: 1 }}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                        <thead>
                            <tr style={{borderBottom:'2px solid #eee', color:'#444', background:'#f8f9fa'}}>
                                <th style={{padding:'10px', textAlign:'left', width:'30px'}}>#</th>
                                <th style={{padding:'10px', textAlign:'left'}}>Artículo</th>
                                <th style={{padding:'10px', textAlign:'left'}}>Rubro / Marca</th>
                                <th style={{padding:'10px', textAlign:'left'}}>Ubicación</th>
                                <th style={{padding:'10px', textAlign:'left'}}>Costo</th>
                                <th style={{padding:'10px', textAlign:'left'}}>Precio</th>
                                <th style={{padding:'10px', textAlign:'center'}}>Stock (Min/Max)</th>
                                <th style={{padding:'10px', textAlign:'right'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id} style={{borderBottom:'1px solid #f9f9f9', transition:'background 0.2s'}}>
                                    <td style={{padding:'10px', color:'#888', fontFamily:'monospace'}}>{p.sku}</td>
                                    <td style={{padding:'10px'}}>
                                        <div style={{fontWeight:'600', color:'#333'}}>{p.title}</div>
                                        <div style={{color:'#666', fontSize:'11px'}}>{p.barcode || 'S/N'}</div>
                                    </td>
                                    <td style={{padding:'10px'}}>
                                        <div>{p.rubro || p.category}</div>
                                        <div style={{color:'#666', fontSize:'11px', fontStyle:'italic'}}>{p.brand}</div>
                                    </td>
                                    <td style={{padding:'10px', color:'#666'}}>{p.location || '-'}</td>
                                    <td style={{padding:'10px', color:'#666'}}>${Number(p.cost_price || 0).toFixed(2)}</td>
                                    <td style={{padding:'10px', fontWeight:'bold', color:'#166534'}}>${Number(p.price_base).toFixed(2)}</td>
                                    <td style={{padding:'10px', textAlign:'center'}}>
                                        <div style={{fontWeight:'bold', fontSize:'14px', color: p.stock <= (p.stock_min||5) ? 'red' : 'inherit'}}>{p.stock}</div>
                                        <div style={{fontSize:'10px', color:'#888'}}>({p.stock_min || 0} / {p.stock_max || '-'})</div>
                                    </td>
                                    <td style={{padding:'10px', textAlign:'right'}}>
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

            {/* Hidden Print Area - Rendered in Portal to avoid DOM conflicts */}
            {createPortal(
                <div style={{ display: 'none' }}>
                    <PosTicket order={orderToPrint} componentRef={componentRef} />
                </div>,
                document.body
            )}
        </div>
    );
}


const statCardStyle = { background: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '120px' };
const statLabelStyle = { display: 'block', fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '5px' };
const statValueStyle = { fontSize: '24px', fontWeight: '800', color: '#333' };

// Helpers styles moved outside or renamed if they conflict, but here they are just variables.
// The previous "formGroup", "labelStyle", "inputStyle" inside the component were shadowing or causing confusion if used globally.
// In React functional components, these constant styles are better placed outside.

export default AdminDashboard;
