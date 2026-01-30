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
    Building,
    Globe,
    Receipt,
    CreditCard,
    UserCog
} from 'lucide-react';

import ChatbotManager from './ChatbotManager';

function AdminDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pos' | 'inventory' | 'clients' | 'suppliers' | 'cash' | 'reports' | 'settings' | 'chatbot'
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
    const [userSearch, setUserSearch] = useState('');
    const [filterUserRole, setFilterUserRole] = useState('TODOS');
    const [filterUserDept, setFilterUserDept] = useState('TODOS');
    const [filterUserStatus, setFilterUserStatus] = useState('ACTIVOS');

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
                    <li>
                         <button 
                            className={activeTab === 'chatbot' ? 'active' : ''} 
                            onClick={() => setActiveTab('chatbot')}
                        >
                            <Users size={18} /> Chatbot IA
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
                            {activeTab === 'chatbot' && <span key="chatbot">Entrenamiento de Chatbot</span>}
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
                     <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                        {/* Highlights Grid */}
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'}}>
                            {/* Products Card */}
                            <div style={{background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', display:'flex', alignItems:'center', gap:'20px', border: '1px solid #f3f4f6'}}>
                                <div style={{minWidth:'56px', height:'56px', borderRadius:'16px', background:'#fdf2f8', display:'flex', alignItems:'center', justifyContent:'center', color:'#db2777'}}>
                                    <Package size={28} />
                                </div>
                                <div style={{flex: 1}}>
                                   <div style={{fontSize:'32px', fontWeight:'800', color:'#111827', lineHeight: '1', marginBottom: '4px'}}>{totalProducts}</div>
                                   <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600'}}>Artículos en Maestro</div>
                                </div>
                            </div>
                            
                            {/* Stock Critico */}
                            <div style={{background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', display:'flex', alignItems:'center', gap:'20px', border: '1px solid #f3f4f6'}}>
                                <div style={{minWidth:'56px', height:'56px', borderRadius:'16px', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', color:'#dc2626'}}>
                                    <AlertTriangle size={28} />
                                </div>
                                <div style={{flex: 1}}>
                                   <div style={{fontSize:'32px', fontWeight:'800', color:'#dc2626', lineHeight: '1', marginBottom: '4px'}}>{lowStock}</div>
                                   <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600'}}>Stock Crítico / Reponer</div>
                                </div>
                            </div>

                            {/* Valor Inventario */}
                            <div style={{background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', display:'flex', alignItems:'center', gap:'20px', border: '1px solid #f3f4f6'}}>
                                <div style={{minWidth:'56px', height:'56px', borderRadius:'16px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', color:'#16a34a'}}>
                                    <DollarSign size={28} />
                                </div>
                                <div style={{flex: 1}}>
                                   <div style={{fontSize:'32px', fontWeight:'800', color:'#16a34a', lineHeight: '1', marginBottom: '4px'}}>${inventoryValue.toLocaleString()}</div>
                                   <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600'}}>Valor Inventario</div>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Stats Grid */}
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px'}}>
                            
                            {/* Campañas */}
                            <div style={{background:'white', padding:'20px', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', color:'#ea580c'}}>
                                    <Megaphone size={20} />
                                </div>
                                <div>
                                    <div style={{fontSize:'20px', fontWeight:'700', color:'#1f2937'}}>{campaigns.filter(c => c.is_active).length}</div>
                                    <div style={{fontSize:'12px', fontWeight:'600', color:'#6b7280'}}>Campañas Activas</div>
                                </div>
                            </div>

                            {/* Usuarios */}
                            <div style={{background:'white', padding:'20px', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#2563eb'}}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div style={{fontSize:'20px', fontWeight:'700', color:'#1f2937'}}>{users.length}</div>
                                    <div style={{fontSize:'12px', fontWeight:'600', color:'#6b7280'}}>Usuarios</div>
                                </div>
                            </div>

                            {/* Pedidos Pendientes */}
                            <div style={{background:'white', padding:'20px', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center', color:'#ca8a04'}}>
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <div style={{fontSize:'20px', fontWeight:'700', color:'#1f2937'}}>{pendingOrders}</div>
                                    <div style={{fontSize:'12px', fontWeight:'600', color:'#6b7280'}}>Pedidos Pendientes</div>
                                </div>
                            </div>

                            {/* Ventas Totales */}
                            <div style={{background:'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding:'20px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '16px', color: 'white'}}>
                                <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <DollarSign size={20} color="white"/>
                                </div>
                                <div>
                                    <div style={{fontSize:'20px', fontWeight:'700'}}>${revenue.toLocaleString()}</div>
                                    <div style={{fontSize:'12px', fontWeight:'500', opacity: 0.9}}>Ventas Totales</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{background:'white', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
                            <div style={{padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0}}>Actividad Reciente</h3>
                                <button className="secondary-btn" onClick={() => setActiveTab('orders')} style={{fontSize: '12px', padding: '6px 12px'}}>Ver Todo</button>
                            </div>
                            <div>
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} style={{display:'flex', justifyContent:'space-between', alignItems: 'center', padding:'20px 24px', borderBottom:'1px solid #f9fafb', transition: 'background 0.2s', cursor: 'pointer'}} onMouseOver={e=>e.currentTarget.style.background='#f9fafb'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                            <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: '700', fontSize: '14px'}}>
                                                #{o.id}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: '600', color: '#1f2937', fontSize: '14px'}}>{o.customer_name}</div>
                                                <div style={{fontSize: '12px', color: '#9ca3af'}}>{new Date(o.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            <div style={{fontWeight: '700', color: '#111827', fontSize: '15px'}}>${parseFloat(o.total).toLocaleString()}</div>
                                            <span style={{padding:'4px 10px', borderRadius:'9999px', fontSize:'11px', fontWeight: '700', background: o.status === 'pending' ? '#fef3c7' : '#dcfce7', color: o.status === 'pending' ? '#92400e' : '#166534', display: 'inline-block', marginTop: '4px'}}>
                                                {o.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div style={{padding: '40px', textAlign: 'center', color: '#9ca3af'}}>
                                        <div style={{fontSize: '48px', marginBottom: '16px'}}>💤</div>
                                        <p>No hay actividad reciente registrada.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                 )}

            {/* --- POS VIEW --- */}
            {activeTab === 'pos' && (
                <div style={{display:'flex', gap:'24px', height:'calc(100vh - 120px)', marginTop: '8px'}}>
                    {/* LEFT: Product Selection */}
                    <div style={{flex: 2, display:'flex', flexDirection:'column', gap:'20px', minWidth: '0'}}>
                        
                        {/* Search Bar */}
                        <div style={{background:'white', padding:'20px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border:'1px solid #e5e7eb'}}>
                            <div style={{position:'relative', width: '100%'}}>
                                <Search size={22} style={{position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af'}} />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Buscar producto por nombre, SKU o escanear código de barras..." 
                                    value={posSearch}
                                    onChange={(e) => setPosSearch(e.target.value)}
                                    // Simula un escáner de código de barras presionando Enter
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const exactMatch = products.find(p => p.sku === posSearch || p.barcode === posSearch);
                                            if (exactMatch) {
                                                addToPosCart(exactMatch);
                                                setPosSearch('');
                                            }
                                        }
                                    }}
                                    style={{width:'100%', padding:'16px 16px 16px 52px', fontSize:'16px', border:'1px solid #e5e7eb', borderRadius:'12px', outline:'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f9fafb', color: '#111827'}} 
                                    onFocus={(e) => {e.target.style.borderColor = '#2563eb'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)'}}
                                    onBlur={(e) => {e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'}}
                                />
                                <div style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px'}}>
                                    <div style={{border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#6b7280', background: 'white', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>ESCANEÁ AQUÍ</div>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div style={{flex:1, overflowY:'auto', background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border:'1px solid #e5e7eb'}}>
                            {posSearch.length === 0 ? (
                                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                    <h4 style={{fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{width: '32px', height: '32px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'}}>
                                            <span style={{fontSize: '16px'}}>★</span>
                                        </div>
                                        Productos Frecuentes
                                    </h4>
                                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px', alignContent: 'start'}}>
                                        {products.slice(0, 10).map(p => (
                                            <button key={p.id} onClick={() => addToPosCart(p)} style={{
                                                border: '1px solid #f3f4f6', background: 'white', padding: '0', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', 
                                                display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', height: '100%',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#bfdbfe'}}
                                            onMouseLeave={e => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f3f4f6'}}
                                            >
                                                <div style={{height: '140px', width: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
                                                    {p.images && p.images[0] ? (
                                                        <img src={p.images[0]} style={{width:'100%', height:'100%', objectFit:'cover', transition: 'transform 0.5s'}} alt=""/> 
                                                    ) : (
                                                        <Package size={48} color="#cbd5e1" style={{opacity: 0.5}}/>
                                                    )}
                                                    <div style={{position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.95)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: p.stock > 0 ? '#059669' : '#dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backdropFilter: 'blur(4px)'}}>
                                                        {p.stock} un
                                                    </div>
                                                </div>
                                                <div style={{padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '12px'}}>
                                                    <div style={{fontSize: '14px', fontWeight: '600', color: '#374151', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', height: '40px'}}>
                                                        {p.title}
                                                    </div>
                                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                        <div style={{fontSize: '18px', fontWeight: '800', color: '#059669'}}>${Number(p.price_base).toFixed(2)}</div>
                                                        <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                            <Plus size={14} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px', color: '#9ca3af', flexDirection: 'column', gap: '16px'}}>
                                        <div style={{background: '#f3f4f6', padding: '24px', borderRadius: '50%', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
                                            <Search size={40} style={{opacity: 0.5}} />
                                        </div>
                                        <div style={{textAlign: 'center'}}>
                                            <p style={{marginBottom: '4px', fontWeight: '700', color: '#4b5563', fontSize: '18px'}}>Lista para vender</p>
                                            <p style={{fontSize: '14px', color: '#6b7280'}}>Busca productos o escanea un código de barras para comenzar una venta</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px'}}>
                                    {products.filter(p => 
                                        p.title.toLowerCase().includes(posSearch.toLowerCase()) || 
                                        p.sku.toLowerCase().includes(posSearch.toLowerCase()) ||
                                        (p.barcode && p.barcode.includes(posSearch))
                                    ).map(p => (
                                        <div key={p.id} onClick={() => addToPosCart(p)} style={{border:'1px solid #e5e7eb', borderRadius:'16px', cursor:'pointer', position:'relative', transition:'all 0.2s', background: 'white', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}
                                            onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                                            onMouseLeave={e => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}}
                                        >
                                            <div style={{height:'150px', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center', position: 'relative'}}>
                                                {p.images && p.images[0] ? <img src={p.images[0]} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : <Package size={48} color="#cbd5e1" style={{opacity: 0.6}}/>}
                                                <div style={{position: 'absolute', bottom: '0', left: '0', right: '0', padding: '8px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)', color: 'white', fontSize: '11px', fontWeight: '600'}}>
                                                    SKU: {p.sku}
                                                </div>
                                            </div>
                                            <div style={{padding: '16px'}}>
                                                <div style={{fontSize:'14px', fontWeight:'600', marginBottom:'12px', color: '#1f2937', height: '40px', overflow: 'hidden', lineHeight: '1.4'}}>{p.title}</div>
                                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                     <div style={{fontSize:'18px', color:'#059669', fontWeight:'800'}}>${Number(p.price_base).toFixed(2)}</div>
                                                     <div style={{fontSize:'11px', background: p.stock > 0 ? '#ecfdf5' : '#fef2f2', color: p.stock > 0 ? '#047857' : '#b91c1c', padding:'4px 8px', borderRadius:'9999px', fontWeight: '700', border: p.stock > 0 ? '1px solid #a7f3d0' : '1px solid #fecaca'}}>
                                                        {p.stock} un
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {products.filter(p => p.title.toLowerCase().includes(posSearch.toLowerCase())).length === 0 && (
                                        <div style={{gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#6b7280'}}>
                                            <div style={{fontSize: '48px', marginBottom: '16px'}}>🔍</div>
                                            <p style={{fontSize: '16px', fontWeight: '600'}}>No se encontraron productos</p>
                                            <p style={{fontSize: '14px', marginTop: '4px'}}>Intenta con otro término de búsqueda</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: TICKET / CART */}
                    <div style={{flex: 1, minWidth: '400px', maxWidth: '450px', background:'white', borderRadius:'16px', boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e5e7eb', display:'flex', flexDirection:'column', overflow:'hidden', position: 'relative'}}>
                        {/* Ticket Header */}
                        <div style={{background: '#111827', color: 'white', padding: '20px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                                <h3 style={{margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.025em'}}>
                                    <ShoppingCart size={20} /> TICKET DE VENTA
                                </h3>
                                <div style={{fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)'}}>
                                    ORDEN #{Math.floor(Math.random() * 10000)}
                                </div>
                            </div>
                            
                            {/* Client Selector (Compact) */}
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <div style={{fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600'}}>Datos del Cliente</div>
                                        <div style={{fontWeight: '700', fontSize: '14px', color: 'white'}}>{posClient.name}</div>
                                    </div>
                                </div>
                                <button className="secondary-btn" style={{padding: '6px', height: 'auto', fontSize: '11px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', ':hover':{background: 'rgba(255,255,255,0.2)'}}} title="Cambiar Cliente">
                                    <UserCog size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div style={{flex:1, overflowY:'auto', padding:'0', background: '#f9fafb'}}>
                            {posCart.length === 0 ? (
                                <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '20px', padding: '40px', textAlign: 'center'}}>
                                    <div style={{width: '96px', height: '96px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb'}}>
                                        <ShoppingCart size={40} opacity={0.3} color="#6b7280" />
                                    </div>
                                    <div style={{maxWidth: '240px'}}>
                                        <p style={{fontWeight: '700', color: '#374151', fontSize: '16px', marginBottom: '8px'}}>Tu carrito está vacío</p>
                                        <p style={{fontSize: '14px', lineHeight: '1.5'}}>Selecciona productos del panel izquierdo para agregarlos a la orden.</p>
                                    </div>
                                </div>
                            ) : (
                                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                                    <thead style={{position:'sticky', top:0, zIndex: 10, background: '#f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                                        <tr style={{color:'#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700'}}>
                                            <th style={{padding:'12px 16px', textAlign:'left'}}>Producto</th>
                                            <th style={{padding:'12px', textAlign:'center', width: '70px'}}>Cant.</th>
                                            <th style={{padding:'12px 20px', textAlign:'right'}}>Total</th>
                                            <th style={{width:'40px'}}></th>
                                        </tr>
                                    </thead>
                                    <tbody style={{background: 'white'}}>
                                        {posCart.map(item => (
                                            <tr key={item.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                                                <td style={{padding:'16px', verticalAlign: 'middle'}}>
                                                    <div style={{fontWeight:'600', color: '#1f2937', marginBottom: '4px', fontSize: '14px'}}>{item.title}</div>
                                                    <div style={{fontSize:'12px', color:'#6b7280'}}>${Number(item.price_base).toFixed(2)} c/u</div>
                                                </td>
                                                <td style={{padding:'16px 8px', verticalAlign: 'middle'}}>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        value={item.qty} 
                                                        onChange={e => updatePosQty(item.id, parseInt(e.target.value))}
                                                        style={{width:'100%', padding:'8px', textAlign:'center', border:'1px solid #d1d5db', borderRadius:'8px', fontWeight: '600', color: '#111827', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', ':focus':{borderColor: '#2563eb'}}} 
                                                    />
                                                </td>
                                                <td style={{padding:'16px 20px', textAlign:'right', fontWeight:'700', color: '#1f2937', fontSize: '15px', verticalAlign: 'middle'}}>
                                                    ${(item.qty * item.price_base).toFixed(2)}
                                                </td>
                                                <td style={{padding:'16px 8px', verticalAlign: 'middle', textAlign: 'center'}}>
                                                    <button onClick={() => removeFromPosCart(item.id)} style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer', padding:'8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'}} className="hover:bg-red-50">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Totals Footer */}
                        <div style={{background:'white', padding: '24px', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.03)', zIndex: 10}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'14px', color:'#6b7280'}}>
                                <span>Subtotal</span>
                                <span>${(posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0) / 1.16).toFixed(2)}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'14px', color:'#6b7280'}}>
                                <span>IVA (16%)</span>
                                <span>${(posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0) - (posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0) / 1.16)).toFixed(2)}</span>
                            </div>
                            
                            <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:'24px', padding: '20px 0', borderTop: '2px dashed #e5e7eb', borderBottom: '2px dashed #e5e7eb'}}>
                                <span style={{fontSize: '15px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total a Pagar</span>
                                <span style={{fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: '1'}}>${posCart.reduce((acc, i) => acc + (i.price_base * i.qty), 0).toFixed(2)}</span>
                            </div>

                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                                <button onClick={() => handlePosCheckout('cash')} style={{background:'#16a34a', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)'}} onMouseOver={e => e.currentTarget.style.background = '#15803d'} onMouseOut={e => e.currentTarget.style.background = '#16a34a'}>
                                    <Banknote size={24} style={{marginBottom: '4px'}}/> 
                                    <span style={{fontWeight: '700', fontSize: '14px'}}>EFECTIVO</span>
                                </button>
                                <button onClick={() => handlePosCheckout('card')} style={{background:'#0ea5e9', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'}} onMouseOver={e => e.currentTarget.style.background = '#0284c7'} onMouseOut={e => e.currentTarget.style.background = '#0ea5e9'}>
                                    <CreditCard size={24} style={{marginBottom: '4px'}}/> 
                                    <span style={{fontWeight: '700', fontSize: '14px'}}>TARJETA</span>
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
                     <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                        
                        {/* Reports Toolbar */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', padding:'16px 24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
                            <div style={{display:'flex', gap:'12px'}}>
                                <select style={{padding:'8px 12px', borderRadius:'8px', border:'1px solid #d1d5db', background:'#f9fafb', fontSize:'14px', fontWeight:'600', color:'#374151', cursor:'pointer', outline:'none'}}>
                                    <option>Hoy</option>
                                    <option>Esta Semana</option>
                                    <option>Este Mes</option>
                                    <option>Este Año</option>
                                </select>
                                <div style={{height:'36px', width:'1px', background:'#e5e7eb'}}></div>
                                <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', color:'#6b7280'}}>
                                    <span style={{fontWeight:'600'}}>Periodo:</span> 30 Ene 2026
                                </div>
                            </div>
                            <div style={{display:'flex', gap:'12px'}}>
                                <button className="secondary-btn" style={{display:'flex', alignItems:'center', gap:'8px', height:'auto', padding:'8px 16px', fontSize:'13px'}}>
                                    <Download size={16} /> Exportar Excel
                                </button>
                                <button className="secondary-btn" style={{display:'flex', alignItems:'center', gap:'8px', height:'auto', padding:'8px 16px', fontSize:'13px'}}>
                                    <FileText size={16} /> PDF
                                </button>
                            </div>
                        </div>

                        {/* Financial Overview Cards */}
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px'}}>
                             {/* Gross Sales */}
                             <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
                                    <div>
                                        <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600', marginBottom:'4px'}}>Ventas Brutas</div>
                                        <div style={{fontSize:'28px', fontWeight:'800', color:'#111827'}}>${revenue.toLocaleString()}</div>
                                    </div>
                                    <div style={{padding:'8px', background:'#ecfdf5', borderRadius:'10px', color:'#047857'}}>
                                        <Banknote size={24} />
                                    </div>
                                </div>
                                <div style={{fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', color:'#16a34a', fontWeight:'600'}}>
                                    <span style={{background:'#dcfce7', padding:'2px 6px', borderRadius:'4px'}}>+12.5%</span> 
                                    <span style={{color:'#6b7280', fontWeight:'400'}}>vs periodo anterior</span>
                                </div>
                             </div>

                             {/* Net Profit (Simulated) */}
                             <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
                                    <div>
                                        <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600', marginBottom:'4px'}}>Utilidad Neta</div>
                                        <div style={{fontSize:'28px', fontWeight:'800', color:'#111827'}}>${(revenue * 0.35).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                                    </div>
                                    <div style={{padding:'8px', background:'#eff6ff', borderRadius:'10px', color:'#1d4ed8'}}>
                                        <BarChart3 size={24} />
                                    </div>
                                </div>
                                <div style={{fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', color:'#1d4ed8', fontWeight:'600'}}>
                                    <span style={{background:'#dbeafe', padding:'2px 6px', borderRadius:'4px'}}>35%</span> 
                                    <span style={{color:'#6b7280', fontWeight:'400'}}>Margen promedio</span>
                                </div>
                             </div>

                             {/* Transactions */}
                             <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
                                    <div>
                                        <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600', marginBottom:'4px'}}>Transacciones</div>
                                        <div style={{fontSize:'28px', fontWeight:'800', color:'#111827'}}>{orders.length}</div>
                                    </div>
                                    <div style={{padding:'8px', background:'#fff7ed', borderRadius:'10px', color:'#c2410c'}}>
                                        <Receipt size={24} />
                                    </div>
                                </div>
                                <div style={{fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', color:'#c2410c', fontWeight:'600'}}>
                                    <span style={{background:'#ffedd5', padding:'2px 6px', borderRadius:'4px'}}>${(revenue / (orders.length || 1)).toFixed(0)}</span> 
                                    <span style={{color:'#6b7280', fontWeight:'400'}}>Ticket promedio</span>
                                </div>
                             </div>

                             {/* Items Sold */}
                             <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
                                    <div>
                                        <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'600', marginBottom:'4px'}}>Productos Vendidos</div>
                                        <div style={{fontSize:'28px', fontWeight:'800', color:'#111827'}}>{itemsSold || 0}</div>
                                    </div>
                                    <div style={{padding:'8px', background:'#fdf2f8', borderRadius:'10px', color:'#be185d'}}>
                                        <ShoppingBag size={24} />
                                    </div>
                                </div>
                                <div style={{fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', color:'#be185d', fontWeight:'600'}}>
                                    <span style={{background:'#fce7f3', padding:'2px 6px', borderRadius:'4px'}}>+5</span> 
                                    <span style={{color:'#6b7280', fontWeight:'400'}}>vs semana pasada</span>
                                </div>
                             </div>
                        </div>

                        {/* Graph and Top Products Split */}
                        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
                            
                            {/* Monthly Sales Chart (CSS only) */}
                            <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
                                <h3 style={{margin:'0 0 24px 0', fontSize:'18px', fontWeight:'700', color:'#1f2937'}}>Ventas por Día</h3>
                                
                                <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', height: '240px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb'}}>
                                    {[65, 40, 75, 55, 80, 45, 90, 60, 70, 85].map((h, i) => (
                                        <div key={i} style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', group: 'bar'}}>
                                            <div style={{
                                                width: '100%', 
                                                height: `${h}%`, 
                                                background: i === 9 ? '#2563eb' : '#e5e7eb', 
                                                borderRadius: '6px 6px 0 0',
                                                transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#3b82f6'}
                                            onMouseOut={e => e.currentTarget.style.background = i === 9 ? '#2563eb' : '#e5e7eb'}
                                            title={`Ventas: $${h * 100}`}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', marginTop: '10px', color: '#9ca3af', fontSize: '12px', fontWeight: '600'}}>
                                    <span>01 Ene</span>
                                    <span>05 Ene</span>
                                    <span>10 Ene</span>
                                    <span>15 Ene</span>
                                    <span>20 Ene</span>
                                    <span>25 Ene</span>
                                    <span>30 Ene</span>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                <h3 style={{margin:'0 0 20px 0', fontSize:'18px', fontWeight:'700', color:'#1f2937'}}>Más Vendidos</h3>
                                <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                                    {products.slice(0, 5).map((p, idx) => (
                                        <div key={p.id} style={{display:'flex', alignItems:'center', gap:'16px'}}>
                                            <div style={{fontSize:'14px', fontWeight:'800', color:'#9ca3af', width: '20px'}}>{idx + 1}</div>
                                            <div style={{width:'48px', height:'48px', borderRadius:'8px', background:'#f3f4f6', overflow:'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                {p.images && p.images[0] ? <img src={p.images[0]} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <Package size={20} color="#cbd5e1"/>}
                                            </div>
                                            <div style={{flex: 1}}>
                                                <div style={{fontSize:'14px', fontWeight:'600', color:'#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px'}}>{p.title}</div>
                                                <div style={{fontSize:'12px', color:'#6b7280'}}>{Math.floor(Math.random() * 50) + 10} vendidos</div>
                                            </div>
                                            <div style={{fontSize:'14px', fontWeight:'700', color:'#16a34a'}}>${(p.price_base * (Math.floor(Math.random() * 20)+1)).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="secondary-btn" style={{width:'100%', marginTop:'24px', justifyContent:'center', fontSize:'13px'}}>Ver Ranking Completo</button>
                            </div>
                        </div>

                         {/* Breakdown Table */}
                         <div style={{background:'white', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
                            <div style={{padding: '20px 24px', borderBottom: '1px solid #f3f4f6'}}>
                                <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937'}}>Desglose por Categoría (Rubro)</h3>
                            </div>
                            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
                                <thead style={{background:'#f9fafb', color:'#6b7280', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                    <tr>
                                        <th style={{padding:'16px 24px', textAlign:'left', fontWeight:'700'}}>Categoría</th>
                                        <th style={{padding:'16px 24px', textAlign:'right', fontWeight:'700'}}>Items Vendidos</th>
                                        <th style={{padding:'16px 24px', textAlign:'right', fontWeight:'700'}}>Ventas Totales</th>
                                        <th style={{padding:'16px 24px', textAlign:'right', fontWeight:'700'}}>% del Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Herramientas Eléctricas', 'Plomería', 'Construcción', 'Pinturas', 'Jardinería'].map((cat, i) => (
                                        <tr key={cat} style={{borderBottom:'1px solid #f3f4f6'}}>
                                            <td style={{padding:'16px 24px', fontWeight:'600', color:'#374151'}}>{cat}</td>
                                            <td style={{padding:'16px 24px', textAlign:'right', color:'#6b7280'}}>{Math.floor(Math.random() * 100) + 20}</td>
                                            <td style={{padding:'16px 24px', textAlign:'right', fontWeight:'700', color:'#111827'}}>${(Math.random() * 50000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td style={{padding:'16px 24px', textAlign:'right', color:'#6b7280'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end'}}>
                                                    {25 - (i*5)}%
                                                    <div style={{width: '60px', height: '6px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden'}}>
                                                        <div style={{width: `${25 - (i*5)}%`, height: '100%', background: '#2563eb'}}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     </div>
                 )}
                 
                 {activeTab === 'chatbot' && <ChatbotManager />}

                 {/* --- SETTINGS --- */}
                 {activeTab === 'settings' && (
                     <div style={{display:'flex', flexDirection:'column', gap:'32px'}}>
                        
                         {/* General Administration */}
                         <div>
                             <h3 style={{fontSize:'18px', fontWeight:'700', color:'#111827', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                                <div style={{width:'24px', height:'24px', borderRadius:'6px', background:'#eef2ff', color:'#4338ca', display:'flex', alignItems:'center', justifyContent:'center'}}><Settings size={14}/></div>
                                Administración General
                             </h3>
                             <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
                                 <div onClick={() => setActiveTab('users')} style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'start', gap:'16px'}} 
                                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
                                 >
                                     <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#eff6ff', color:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                         <Users size={24} />
                                     </div>
                                     <div>
                                         <div style={{fontSize:'16px', fontWeight:'700', color:'#1f2937'}}>Usuarios y Permisos</div>
                                         <div style={{fontSize:'13px', color:'#6b7280', marginTop:'4px', lineHeight:'1.5'}}>Gestiona el personal, roles y accesos al sistema.</div>
                                     </div>
                                 </div>

                                 <div style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', cursor:'not-allowed', display:'flex', alignItems:'start', gap:'16px', opacity: 0.7}}>
                                     <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#f3f4f6', color:'#6b7280', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                         <Building size={24} />
                                     </div>
                                     <div>
                                         <div style={{fontSize:'16px', fontWeight:'700', color:'#1f2937'}}>Datos de Empresa</div>
                                         <div style={{fontSize:'13px', color:'#6b7280', marginTop:'4px', lineHeight:'1.5'}}>Configura el logo, dirección y datos fiscales.</div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Web Integrations */}
                         <div>
                             <h3 style={{fontSize:'18px', fontWeight:'700', color:'#111827', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                                <div style={{width:'24px', height:'24px', borderRadius:'6px', background:'#fff7ed', color:'#c2410c', display:'flex', alignItems:'center', justifyContent:'center'}}><Globe size={14}/></div>
                                Integraciones Web
                             </h3>
                             <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
                                 <div onClick={() => setActiveTab('marketing')} style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'start', gap:'16px'}}
                                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
                                 >
                                     <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#fff7ed', color:'#ea580c', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                         <Megaphone size={24} />
                                     </div>
                                     <div>
                                         <div style={{fontSize:'16px', fontWeight:'700', color:'#1f2937'}}>Marketing Web</div>
                                         <div style={{fontSize:'13px', color:'#6b7280', marginTop:'4px', lineHeight:'1.5'}}>Gestiona banners, promociones y productos destacados.</div>
                                     </div>
                                 </div>

                                 <div onClick={() => setActiveTab('cms')} style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'start', gap:'16px'}}
                                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
                                 >
                                     <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#fdf2f8', color:'#db2777', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                         <LayoutList size={24} />
                                     </div>
                                     <div>
                                         <div style={{fontSize:'16px', fontWeight:'700', color:'#1f2937'}}>CMS / Páginas</div>
                                         <div style={{fontSize:'13px', color:'#6b7280', marginTop:'4px', lineHeight:'1.5'}}>Edita el contenido de páginas institucionales.</div>
                                     </div>
                                 </div>

                                 <div onClick={() => setActiveTab('chatbot')} style={{background:'white', padding:'24px', borderRadius:'16px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'start', gap:'16px'}}
                                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
                                 >
                                     <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#f0fdf4', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                         <div style={{fontWeight:'800'}}>AI</div>
                                     </div>
                                     <div>
                                         <div style={{fontSize:'16px', fontWeight:'700', color:'#1f2937'}}>Chatbot Inteligente</div>
                                         <div style={{fontSize:'13px', color:'#6b7280', marginTop:'4px', lineHeight:'1.5'}}>Entrena el asistente virtual para consultas de clientes.</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         
                         <div style={{textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '40px'}}>
                            Sistema v2.5.0 - Build 2026.01.30
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
                 <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', padding: '24px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '24px'}}>
                         <div>
                             <h2 style={{fontSize:'20px', fontWeight:'700', color:'#111827', margin:0}}>Gestión de Clientes</h2>
                             <p style={{margin:'4px 0 0', color:'#6b7280', fontSize:'14px'}}>Administra tu base de datos de clientes y cuentas de crédito</p>
                         </div>
                         <button onClick={() => openClientModal()} className="primary-btn" style={{display:'flex', gap:'8px', alignItems:'center', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600'}}>
                            <Plus size={18}/> Nuevo Cliente
                         </button>
                    </div>

                    <div style={{display:'flex', gap:'16px', marginBottom:'24px', alignItems: 'center'}}>
                        <div style={{position:'relative', flex:1, maxWidth: '400px'}}>
                            <Search size={20} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af'}} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre, RFC, email..." 
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchClients()}
                                style={{width:'100%', padding:'10px 10px 10px 40px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'}}
                                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>
                        <button onClick={fetchClients} style={{padding: '10px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', fontSize: '14px'}}>
                            Actualizar
                        </button>
                    </div>
                    
                    <div style={{overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead>
                                <tr style={{background:'#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                                    <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>ID</th>
                                    <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Cliente</th>
                                    <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Contacto</th>
                                    <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Ubicación</th>
                                    <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Crédito</th>
                                    <th style={{padding:'12px 16px', textAlign:'right', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody style={{divideY: '1px solid #e5e7eb'}}>
                                {clients.map(c => (
                                    <tr key={c.id} style={{borderBottom:'1px solid #f3f4f6', backgroundColor: 'white', transition: 'background 0.15s'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                        <td style={{padding:'16px', color: '#6b7280', fontSize: '13px'}}>#{c.id}</td>
                                        <td style={{padding:'16px'}}>
                                            <div style={{fontWeight:'600', color: '#111827', marginBottom: '2px'}}>{c.full_name}</div>
                                            <div style={{color:'#6b7280', fontSize:'13px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                <span style={{fontSize: '11px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '600', color: '#4b5563'}}>RFC</span> 
                                                {c.rfc || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{padding:'16px'}}>
                                            <div style={{marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151'}}>
                                                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb'}}><span style={{fontSize: '14px'}}>@</span></div>
                                                {c.email}
                                            </div>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280'}}>
                                                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534'}}><span style={{fontSize: '10px'}}>📞</span></div>
                                                {c.phone}
                                            </div>
                                        </td>
                                        <td style={{padding:'16px', fontSize: '13px', color: '#4b5563'}}>
                                            <div style={{fontWeight: '500'}}>{c.city}, {c.state}</div>
                                            <div style={{color:'#9ca3af', fontSize:'12px'}}>{c.colonia}</div>
                                        </td>
                                        <td style={{padding:'16px'}}>
                                            <div style={{fontSize: '13px', color: '#4b5563', marginBottom: '4px'}}>Límite: <span style={{fontWeight: '600'}}>${parseFloat(c.credit_limit || 0).toFixed(2)}</span></div>
                                            {(c.current_debt || 0) > 0 ? (
                                                <div style={{display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', background: '#fef2f2', color: '#991b1b', fontSize: '12px', fontWeight: '600', border: '1px solid #fecaca'}}>
                                                    Deuda: ${parseFloat(c.current_debt || 0).toFixed(2)}
                                                </div>
                                            ) : (
                                                 <div style={{display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', background: '#ecfdf5', color: '#047857', fontSize: '12px', fontWeight: '600', border: '1px solid #a7f3d0'}}>
                                                    Al corriente
                                                </div>
                                            )}
                                        </td>
                                        <td style={{padding:'16px', textAlign:'right'}}>
                                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                                                <button onClick={() => openClientModal(c)} style={{padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'}} title="Editar">
                                                    <PenSquare size={16}/>
                                                </button>
                                                <button onClick={() => handleDeleteClient(c.id)} style={{padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'}} title="Eliminar">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
                                            <UserCog size={48} style={{marginBottom: '10px', opacity: 0.2}} />
                                            <p>No se encontraron clientes</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}
            
            {/* --- CLIENT MODAL --- */}
            {activeTab === 'clients' && editingClient && (
                <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'#f3f4f6', zIndex:2000, padding:'20px', overflowY:'auto'}}>
                    <div style={{maxWidth:'800px', margin:'0 auto', background:'white', borderRadius:'12px', padding:'30px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #e5e7eb'}}>
                            <button onClick={() => setEditingClient(null)} style={{background:'none', border:'none', cursor:'pointer', color:'#4b5563', display:'flex', alignItems:'center', gap:'5px', fontSize:'14px', fontWeight:'600'}}>
                                <ArrowLeft size={20} /> Regresar
                            </button>
                            <h2 style={{margin:0, fontSize:'20px'}}>{editingClient.id ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
                        </div>
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
                            <div style={{marginTop:'30px', display:'flex', justifyContent:'flex-end', gap:'15px', borderTop:'1px solid #f3f4f6', paddingTop:'20px'}}>
                                <button type="button" onClick={() => setEditingClient(null)} className="secondary-btn" style={{padding:'10px 20px'}}>Cancelar</button>
                                <button type="submit" className="primary-btn" style={{padding:'10px 24px'}}>Guardar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- USERS VIEW --- */}
            {activeTab === 'users' && (
                <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', padding: '24px'}}>
                    
                    {/* Filters */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Estado</label>
                            <select 
                                value={filterUserStatus} 
                                onChange={e => setFilterUserStatus(e.target.value)}
                                style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '14px', outline: 'none'}}
                            >
                                <option value="ACTIVOS">ACTIVOS</option>
                                <option value="INACTIVOS">INACTIVOS</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Rol</label>
                            <select 
                                value={filterUserRole} 
                                onChange={e => setFilterUserRole(e.target.value)}
                                style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '14px', outline: 'none'}}
                            >
                                <option value="TODOS">TODOS</option>
                                <option value="customer">CLIENTE</option>
                                <option value="admin">ADMINISTRADOR</option>
                                <option value="seller">VENDEDOR</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Departamento</label>
                            <select 
                                value={filterUserDept} 
                                onChange={e => setFilterUserDept(e.target.value)}
                                style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '14px', outline: 'none'}}
                            >
                                <option value="TODOS">TODOS</option>
                                <option value="DESPACHO">DESPACHO</option>
                                <option value="BIENESTAR">BIENESTAR</option>
                            </select>
                        </div>
                         <div style={{display: 'flex', alignItems: 'end', gap: '10px'}}>
                            <button className="secondary-btn" style={{padding:'10px 15px', borderRadius: '8px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer'}}>
                                <Download size={16} /> Excel
                            </button>
                             <button className="secondary-btn" style={{padding:'10px 15px', borderRadius: '8px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer'}}>
                                <LayoutList size={16} /> Columnas
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{position: 'relative', marginBottom: '24px'}}>
                        <Search size={20} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af'}} />
                        <input 
                            placeholder="Buscar usuarios..." 
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            style={{width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}} 
                        />
                         <button className="primary-btn" style={{position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', backgroundColor: '#16a34a', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                            <Plus size={16} /> Agregar
                        </button>
                    </div>

                    
                    <div style={{overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <tr>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Nombre Completo</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Usuario</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Empresa / RFC</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Rol</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Asignar Rol</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Fecha Reg.</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody style={{divideY: '1px solid #e5e7eb'}}>
                                {users.filter(u => {
                                     return (filterUserRole === 'TODOS' || u.role === filterUserRole) &&
                                            (userSearch === '' || 
                                             (u.full_name && u.full_name.toLowerCase().includes(userSearch.toLowerCase())) ||
                                             (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())));
                                }).map(u => (
                                    <tr key={u.id} style={{borderBottom:'1px solid #f3f4f6', backgroundColor: 'white'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{fontWeight:'600', color: '#111827'}}>{u.full_name || 'N/A'}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px'}}>No. Empleado: {u.id + 42000}</div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                             <div style={{fontWeight:'500', color: '#374151'}}>{u.email ? u.email.split('@')[0].toUpperCase() : 'N/A'}</div>
                                             <div style={{color:'#6b7280', fontSize:'12px'}}>{u.email}</div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{color: '#374151'}}>{u.company_name || '-'}</div>
                                            <div style={{fontSize:'11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'inline-block', marginTop: '4px'}}>
                                                {u.rfc || 'Sin RFC'}
                                            </div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <span style={{
                                                background: u.role === 'admin' ? '#fef2f2' : u.role === 'customer' ? '#eff6ff' : '#fffbeb',
                                                color: u.role === 'admin' ? '#b91c1c' : u.role === 'customer' ? '#1d4ed8' : '#b45309',
                                                padding: '4px 10px', borderRadius:'9999px', fontSize:'12px', fontWeight:'600', border: `1px solid ${u.role === 'admin' ? '#fecaca' : u.role === 'customer' ? '#bfdbfe' : '#fde68a'}`
                                            }}>
                                                {u.role ? u.role.toUpperCase() : 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <select 
                                                value={u.role} 
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                style={{padding:'8px', borderRadius:'6px', border:'1px solid #d1d5db', width: '140px', fontSize: '13px'}}
                                                disabled={u.email === user.email}
                                            >
                                                <option value="customer">Cliente</option>
                                                <option value="seller">Vendedor</option>
                                                <option value="accountant">Contador</option>
                                                <option value="warehouse">Almacenista</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td style={{padding: '16px 24px', color:'#4b5563', fontSize: '13px'}}>
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                                        </td>
                                         <td style={{padding: '16px 24px'}}>
                                             <div style={{display: 'flex', gap: '10px'}}>
                                                <button style={{color: '#2563eb', cursor: 'pointer', background: 'none', border:'none'}}><PenSquare size={18} /></button>
                                                <button style={{color: '#dc2626', cursor: 'pointer', background: 'none', border:'none'}}><Trash2 size={18} /></button>
                                             </div>
                                         </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>No se encontraron usuarios</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- CASH VIEW --- */}
            {activeTab === 'cash' && (
                <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', padding: '24px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '24px'}}>
                        <h2 style={{fontSize:'20px', fontWeight:'700', color:'#111827', margin:0}}>Control de Caja y Flujo de Efecito</h2>
                        {cashStatus.isOpen && (
                             <div style={{background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <span style={{width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%'}}></span>
                                CAJA ABIERTA
                             </div>
                        )}
                    </div>
                
                    
                    {!cashStatus.isOpen ? (
                        <div style={{maxWidth:'480px', margin:'60px auto', padding:'40px', border:'1px solid #e5e7eb', borderRadius:'16px', textAlign:'center', backgroundColor: '#f9fafb'}}>
                            <div style={{width: '64px', height: '64px', background: '#ffe4e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#be123c'}}>
                                <AlertTriangle size={32} />
                            </div>
                            <h3 style={{fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px'}}>La caja se encuentra cerrada</h3>
                            <p style={{color:'#6b7280', marginBottom:'32px', fontSize: '14px'}}>Debes iniciar un turno para poder registrar ventas y movimientos de efectivo.</p>
                            
                            <form onSubmit={handleOpenRegister} style={{textAlign: 'left'}}>
                                <div style={{marginBottom:'20px'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>Monto Inicial (Fondo de Caja)</label>
                                    <div style={{position:'relative'}}>
                                        <span style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color: '#6b7280'}}>$</span>
                                        <input required name="amount" type="number" step="0.01" 
                                            style={{width:'100%', padding:'12px 12px 12px 30px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize: '16px', fontWeight: '600', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'}} 
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div style={{marginBottom:'24px'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>Notas de Apertura</label>
                                    <textarea name="notes" placeholder="Ej. Turno matutino, fondo revisado..." 
                                        style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize: '14px', outline: 'none', height: '80px', resize: 'none', boxSizing: 'border-box'}}
                                    ></textarea>
                                </div>
                                <button className="primary-btn" style={{width:'100%', justifyContent:'center', padding: '14px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <CheckCircle size={18} /> ABRIR TURNO DE CAJA
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                             {/* Stats Cards */}
                             <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px', marginBottom:'30px'}}>
                                <div style={{background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding:'24px', borderRadius:'16px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'}}>
                                    <div style={{position: 'relative', zIndex: 2}}>
                                        <div style={{color:'rgba(255,255,255,0.9)', fontWeight:'600', fontSize:'13px', letterSpacing:'0.05em', textTransform: 'uppercase', marginBottom: '4px'}}>Balance Actual en Caja</div>
                                        <div style={{fontSize:'36px', fontWeight:'800', marginBottom: '4px'}}>${parseFloat(cashStatus.currentBalance).toFixed(2)}</div>
                                        <div style={{fontSize: '12px', opacity: 0.8}}>Disponible para operaciones</div>
                                    </div>
                                    <Banknote size={120} style={{position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15, transform: 'rotate(-15deg)'}} />
                                </div>
                                
                                <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                                    <button 
                                        onClick={() => { const amt = prompt("Monto a Ingresar:"); const desc = prompt("Concepto:"); if(amt && desc) handleCashMovement('deposit', amt, desc); }}
                                        style={{background:'#eff6ff', border:'1px solid #dbeafe', borderRadius:'12px', color:'#1e40af', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor:'pointer', transition: 'all 0.2s', fontWeight: '600'}}
                                        onMouseOver={e => e.currentTarget.style.background = '#dbeafe'}
                                        onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb'}}>
                                                <Plus size={20} />
                                            </div>
                                            <div style={{textAlign: 'left'}}>
                                                <div style={{fontSize: '14px'}}>Ingresar Dinero</div>
                                                <div style={{fontSize: '11px', opacity: 0.7, fontWeight: '400'}}>Cambio, depósitos extra</div>
                                            </div>
                                        </div>
                                        <ArrowLeft size={16} style={{transform: 'rotate(180deg)'}} />
                                    </button>

                                    <button 
                                        onClick={() => { const amt = prompt("Monto a Retirar:"); const desc = prompt("Concepto:"); if(amt && desc) handleCashMovement('expense', amt, desc); }}
                                        style={{background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:'12px', color:'#991b1b', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor:'pointer', transition: 'all 0.2s', fontWeight: '600'}}
                                        onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626'}}>
                                                <Minus size={20} />
                                            </div>
                                            <div style={{textAlign: 'left'}}>
                                                <div style={{fontSize: '14px'}}>Retirar Dinero</div>
                                                <div style={{fontSize: '11px', opacity: 0.7, fontWeight: '400'}}>Gastos, pagos a proveedores</div>
                                            </div>
                                        </div>
                                        <ArrowLeft size={16} style={{transform: 'rotate(180deg)'}} />
                                    </button>
                                </div>
                             </div>

                             <div style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px'}}>
                                 <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                     <div style={{background: '#e0f2fe', padding: '8px', borderRadius: '6px', color: '#0369a1'}}>
                                         <ClipboardList size={20} />
                                     </div>
                                     <div>
                                         <div style={{fontSize: '14px', fontWeight: '700', color: '#334155'}}>Corte de Caja (Cierre Z)</div>
                                         <div style={{fontSize: '12px', color: '#64748b'}}>Finaliza el turno actual y genera reporte</div>
                                     </div>
                                 </div>

                                 <form onSubmit={handleCloseRegister} style={{display:'flex', gap:'10px', alignItems: 'center', flexWrap: 'wrap'}}>
                                     <div style={{display:'flex', flexDirection:'column'}}>
                                        <label style={{fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom: '4px', textTransform: 'uppercase'}}>Total Contado</label>
                                        <div style={{position: 'relative'}}>
                                            <span style={{position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', fontSize: '12px', color: '#64748b'}}>$</span>
                                            <input required name="closing_amount" type="number" step="0.01" placeholder="0.00" style={{padding:'8px 8px 8px 20px', width:'120px', border:'1px solid #cbd5e1', borderRadius:'6px', outline: 'none', fontWeight: '600'}} />
                                        </div>
                                     </div>
                                     <div style={{display:'flex', flexDirection:'column'}}>
                                        <label style={{fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom: '4px', textTransform: 'uppercase'}}>Observaciones</label>
                                        <input name="notes" placeholder="Opcional..." style={{padding:'8px', width:'200px', border:'1px solid #cbd5e1', borderRadius:'6px', outline: 'none'}} />
                                     </div>
                                     <button style={{background:'#1e293b', color:'white', border:'none', padding:'0 24px', height: '35px', borderRadius:'6px', cursor:'pointer', fontWeight:'600', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px'}}>
                                         <LogOut size={14} /> CERRAR TURNO
                                     </button>
                                 </form>
                             </div>

                             <h3 style={{fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px'}}>Historial de Movimientos</h3>
                             
                             <div style={{border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden'}}>
                                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                                    <thead>
                                        <tr style={{background:'#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                                            <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Hora</th>
                                            <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Tipo</th>
                                            <th style={{padding:'12px 16px', textAlign:'left', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Concepto</th>
                                            <th style={{padding:'12px 16px', textAlign:'right', color:'#4b5563', fontWeight:'600', fontSize:'12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{divideY: '1px solid #e5e7eb'}}>
                                        {cashStatus.movements.map(m => (
                                            <tr key={m.id} style={{borderBottom:'1px solid #f3f4f6', backgroundColor: 'white'}}>
                                                <td style={{padding:'12px 16px', color: '#6b7280', fontSize: '13px'}}>{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                                <td style={{padding:'12px 16px'}}>
                                                    <span style={{
                                                        padding:'4px 10px', borderRadius:'9999px', fontSize:'11px', fontWeight:'700', textTransform: 'uppercase',
                                                        background: ['deposit','sale','opening'].includes(m.type) ? '#d1fae5' : '#fee2e2',
                                                        color: ['deposit','sale','opening'].includes(m.type) ? '#047857' : '#b91c1c'
                                                    }}>
                                                        {m.type === 'opening' ? 'APERTURA' : m.type === 'sale' ? 'VENTA' : m.type === 'deposit' ? 'INGRESO' : 'GASTO/RETIRO'}
                                                    </span>
                                                </td>
                                                <td style={{padding:'12px 16px', color: '#374151', fontWeight: '500'}}>{m.description}</td>
                                                <td style={{padding:'12px 16px', textAlign:'right', fontWeight:'700', fontFamily: 'monospace', fontSize: '14px', color: ['deposit','sale','opening'].includes(m.type) ? '#059669' : '#dc2626'}}>
                                                    {['deposit','sale','opening'].includes(m.type) ? '+' : '-'} ${parseFloat(m.amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        {cashStatus.movements.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{padding:'40px', textAlign:'center', color:'#9ca3af', fontStyle:'italic'}}>No hay movimientos registrados en este turno</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- SUPPLIERS VIEW --- */}
            {activeTab === 'suppliers' && (
                <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', padding: '24px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '24px'}}>
                         <h2 style={{fontSize:'20px', fontWeight:'700', color:'#111827', margin:0}}>Catálogo de Proveedores</h2>
                         <button onClick={() => openSupplierModal()} className="primary-btn" style={{display:'flex', gap:'5px', alignItems:'center', padding: '10px 20px', borderRadius:'6px', background:'#16a34a', color:'white', border:'none', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>
                            <Plus size={16}/> Nuevo Proveedor
                         </button>
                    </div>

                     <div style={{position: 'relative', marginBottom:'24px'}}>
                        <Search size={20} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af'}} />
                        <input 
                            type="text" 
                            placeholder="Buscar por empresa, contacto, RFC..." 
                            value={supplierSearch}
                            onChange={(e) => setSupplierSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchSuppliers()}
                            style={{width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                        />
                    </div>

                    <div style={{overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <tr>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Empresa</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Contacto Principal</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Datos Fiscales</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Condiciones</th>
                                    <th style={{padding: '12px 24px', textAlign:'right', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody style={{divideY: '1px solid #e5e7eb'}}>
                                {suppliers.map(s => (
                                    <tr key={s.id} style={{borderBottom:'1px solid #f3f4f6', backgroundColor: 'white'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{fontWeight:'600', color: '#111827'}}>{s.company_name}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px'}}>{s.website || '-'}</div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{fontWeight:'500', color: '#374151'}}>{s.contact_name}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px'}}>{s.email}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px'}}>{s.phone}</div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{color: '#374151'}}>{s.rfc || 'S/N'}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px'}}>{s.city}, {s.state}</div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <span style={{background:'#dcfce7', color:'#166534', padding:'2px 8px', borderRadius:'9999px', fontSize:'12px', fontWeight:'600'}}>Crédito: {s.credit_days} días</span>
                                            <div style={{marginTop:'5px', fontSize:'12px', color:'#6b7280'}}>Entrega: {s.delivery_days} días</div>
                                        </td>
                                        <td style={{padding: '16px 24px', textAlign:'right'}}>
                                             <button onClick={() => openSupplierModal(s)} style={{marginRight:'12px', color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}><PenSquare size={18}/></button>
                                            <button onClick={() => handleDeleteSupplier(s.id)} style={{color:'#dc2626', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={18}/></button>
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
                <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'#f3f4f6', zIndex:2000, padding:'20px', overflowY:'auto'}}>
                    <div style={{maxWidth:'800px', margin:'0 auto', background:'white', borderRadius:'12px', padding:'30px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #e5e7eb'}}>
                            <button onClick={() => setEditingSupplier(null)} style={{background:'none', border:'none', cursor:'pointer', color:'#4b5563', display:'flex', alignItems:'center', gap:'5px', fontSize:'14px', fontWeight:'600'}}>
                                <ArrowLeft size={20} /> Regresar
                            </button>
                             <h2 style={{margin:0, fontSize:'20px'}}>{editingSupplier.id ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</h2>
                        </div>
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
                            <div style={{marginTop:'30px', display:'flex', justifyContent:'flex-end', gap:'15px', borderTop:'1px solid #f3f4f6', paddingTop:'20px'}}>
                                <button type="button" onClick={() => setEditingSupplier(null)} className="secondary-btn" style={{padding:'10px 20px'}}>Cancelar</button>
                                <button type="submit" className="primary-btn" style={{padding:'10px 24px'}}>Guardar Proveedor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* --- PRODUCTS VIEW (RENAMED TO INVENTORY) --- */}
            {activeTab === 'inventory' && (
                <>
                {!showForm && (
                <>
                {/* Filters Row */}
                <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Estado</label>
                            <select 
                                value={filterStock}
                                onChange={e => setFilterStock(e.target.value)}
                                style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '14px', outline: 'none'}}
                            >
                                <option value="TODOS">TODOS</option>
                                <option value="ACTIVO">ACTIVOS</option>
                                <option value="BAJO">BAJO STOCK</option>
                                <option value="AGOTADO">AGOTADOS</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Categoría</label>
                            <select 
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '14px', outline: 'none'}}
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
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Departamento</label>
                            <select disabled style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontSize: '14px', outline: 'none', cursor: 'not-allowed'}}>
                                <option>GENERAL</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', alignItems: 'end', gap: '10px'}}>
                            <button className="secondary-btn" onClick={handleExportCSV} style={{padding:'10px 15px', borderRadius: '8px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer'}}>
                                <Download size={16} /> Excel
                            </button>
                            <button className="secondary-btn" style={{padding:'10px 15px', borderRadius: '8px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer'}}>
                                <LayoutList size={16} /> Columnas
                            </button>
                        </div>
                    </div>

                    <div style={{position: 'relative'}}>
                             <Search size={20} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af'}} />
                             <input 
                                placeholder="Buscar productos..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            />
                             <button className="primary-btn" onClick={handleCreate} style={{position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', backgroundColor: '#16a34a', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                                <Plus size={16} /> Agregar
                            </button>
                    </div>
                </div>
                </>
                )}

                {showForm && (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                    <div style={{background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f3f4f6', marginBottom:'24px', paddingBottom:'16px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                             <button onClick={() => setShowForm(false)} style={{background:'#f3f4f6', border:'none', width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#374151', transition:'background 0.2s'}}>
                                <ArrowLeft size={20} />
                             </button>
                             <h3 style={{margin:0, fontSize:'20px', fontWeight:'700', color:'#111827'}}>{editingProduct ? 'Editar Artículo' : 'Nuevo Articulo'}</h3>
                        </div>
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
                </div>
                )}

                {!showForm && (
                <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', padding: '0', overflow: 'hidden'}}>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <tr>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em', width:'30px'}}>#</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Artículo</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Rubro / Marca</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Ubicación</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Costo</th>
                                    <th style={{padding: '12px 24px', textAlign:'left', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Precio</th>
                                    <th style={{padding: '12px 24px', textAlign:'center', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Stock (Min/Max)</th>
                                    <th style={{padding: '12px 24px', textAlign:'right', color:'#4b5563', fontWeight:'600', textTransform:'uppercase', fontSize:'12px', letterSpacing:'0.05em'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody style={{divideY: '1px solid #e5e7eb'}}>
                                {filteredProducts.map(p => (
                                    <tr key={p.id} style={{borderBottom:'1px solid #f3f4f6', backgroundColor: 'white'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                        <td style={{padding: '16px 24px', color:'#6b7280', fontSize:'12px', fontFamily:'monospace'}}>{p.sku}</td>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{fontWeight:'600', color:'#111827'}}>{p.title}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px'}}>{p.barcode || 'S/N'}</div>
                                        </td>
                                        <td style={{padding: '16px 24px'}}>
                                            <div style={{color: '#374151'}}>{p.rubro || p.category}</div>
                                            <div style={{color:'#6b7280', fontSize:'12px', fontStyle:'italic'}}>{p.brand}</div>
                                        </td>
                                        <td style={{padding: '16px 24px', color:'#6b7280'}}>{p.location || '-'}</td>
                                        <td style={{padding: '16px 24px', color:'#6b7280'}}>${Number(p.cost_price || 0).toFixed(2)}</td>
                                        <td style={{padding: '16px 24px', fontWeight:'600', color:'#15803d'}}>${Number(p.price_base).toFixed(2)}</td>
                                        <td style={{padding: '16px 24px', textAlign:'center'}}>
                                            <span style={{
                                                fontWeight:'600', fontSize:'14px', 
                                                color: p.stock <= (p.stock_min||5) ? '#dc2626' : '#111827',
                                                backgroundColor: p.stock <= (p.stock_min||5) ? '#fef2f2' : 'transparent',
                                                padding: p.stock <= (p.stock_min||5) ? '2px 6px' : '0',
                                                borderRadius: '4px'
                                            }}>
                                                {p.stock}
                                            </span>
                                            <div style={{fontSize:'11px', color:'#9ca3af', marginTop: '2px'}}>({p.stock_min || 0} / {p.stock_max || '-'})</div>
                                        </td>
                                        <td style={{padding: '16px 24px', textAlign:'right'}}>
                                            <button onClick={() => handleEdit(p)} style={{background:'none', border:'none', cursor:'pointer', marginRight:'12px', color:'#2563eb', transition: 'color 0.2s'}} title="Editar">
                                                <PenSquare size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#dc2626', transition: 'color 0.2s'}} title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{padding:'40px', textAlign:'center', color:'#6b7280', fontStyle: 'italic'}}>
                                            No se encontraron productos con los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
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
