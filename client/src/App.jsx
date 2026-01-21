import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Departments from './pages/Departments'
import Promotions from './pages/Promotions'
import ProSales from './pages/ProSales'
import Services from './pages/Services'
import Help from './pages/Help'
import DynamicPage from './pages/DynamicPage'
import Toast from './components/Toast'
import Cart from './pages/Cart'
import Footer from './components/Footer'
import { useCart } from './context/CartContext'

function App() {
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  const { getCartCount } = useCart()
  const navigate = useNavigate()

  const showNotification = (message, type = 'info') => {
      setNotification({ message, type });
  }

  const handleLogout = () => {
    setUser(null);
    showNotification('Has cerrado sesión correctamente', 'info');
    navigate('/');
  }

  const handleNavClick = (e, sectionName) => {
      e.preventDefault();
      showNotification(`Sección "${sectionName}" en construcción`, 'warning');
  }

  return (
    <div>
      <header>
        {/* Top Header: Logo, Location, Search, User */}
        <div className="container header-top">
          <div className="header-left">
              <Link to="/" className="hd-logo">
                  <div style={{lineHeight: '0.9', fontSize: '20px'}}>THE</div>
                  <div style={{fontSize: '24px'}}>PRO</div>
                  <div style={{lineHeight: '0.9', fontSize: '18px'}}>CENTER</div>
              </Link>
              
              <div className="store-locator">
                  <div className="location-trigger" onClick={(e) => handleNavClick(e, 'Selector de Tienda')}>
                      📍 <span style={{textDecoration: 'underline'}}>Hermosillo, Son. ▼</span>
                  </div>
                  <div className="store-status">
                      <span style={{color: '#166534', fontWeight: 'bold'}}>Abierto</span> - Cierra a las 10:00 p.m.
                  </div>
              </div>
          </div>
          
          <div className="search-bar-container">
             <form className="search-form" action="/" onSubmit={(e) => {
                 if(!e.target.q.value) { e.preventDefault(); showNotification("Por favor ingresa un término de búsqueda", "error"); }
             }}>
                <input type="text" placeholder="¿Qué estás buscando hoy?" name="q" />
                <button type="submit">🔍</button>
             </form>
          </div>

          <div className="user-controls">
            <div className="user-action" onClick={(e) => !user && handleNavClick(e, 'Mi Cuenta Detallado')}>
                <div style={{color: '#f96302', fontSize: '24px', textAlign: 'center'}}>👤</div>
                {user ? (
                   <div style={{lineHeight: '1.2'}}>
                        <div style={{fontWeight: 'bold', fontSize: '13px'}}>Hola, {user.name.split(' ')[0]}</div>
                        <button onClick={handleLogout} style={{fontSize: '11px', color: '#666', border: 'none', background: 'none', padding: 0, cursor: 'pointer'}}>Cerrar sesión</button>
                   </div>
                ) : (
                   <div style={{lineHeight: '1.2'}}>
                        <Link to="/login" style={{color: '#333', textDecoration: 'none'}}>
                            <div style={{fontSize: '13px'}}>Iniciar sesión</div>
                            <span style={{fontSize: '11px', color: '#f96302', fontWeight: 'bold'}}>Mi Cuenta</span>
                        </Link>
                   </div>
                )}
            </div>
             
             <Link to="/cart" className="user-action cart-action" style={{textDecoration: 'none', color: 'inherit'}}>
                <div style={{color: '#f96302', fontSize: '24px'}}>🛒</div>
                <div id="cart-badge" style={{fontSize: '14px', fontWeight: 'bold', transition: 'transform 0.2s', background: getCartCount() > 0 ? '#f96302' : 'transparent', color: getCartCount() > 0 ? 'white' : '#333', borderRadius: '50%', padding: '2px 6px'}}>{getCartCount()}</div>
             </Link>
          </div>
        </div>
        
        {/* Bottom Header: Navigation Links */}
        <div className="nav-bar-divider"></div>
        <div className="container header-bottom">
            <nav className="main-nav">
                <Link to="/departments">Departamentos</Link>
                <Link to="/promotions">Promociones</Link>
                <Link to="/departments">Catálogo extendido</Link>
                <Link to="/help">Ayuda</Link>
                <Link to="/pro-sales">Ventas a profesionales</Link>
                <Link to="/services">Servicios</Link>
            </nav>
        </div>
      </header>
      
      <div className="container" style={{marginTop: '20px', minHeight: '80vh'}}>
        {notification && (
            <Toast 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification(null)} 
            />
        )}
        <Routes>
          <Route path="/" element={<Home onNotify={showNotification} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetails onNotify={showNotification}/>} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/pro-sales" element={<ProSales />} />
          <Route path="/services" element={<Services />} />
          <Route path="/help" element={<Help />} />
          <Route path="/info/:slug" element={<DynamicPage />} />
        </Routes>
      </div>
      
      <Footer onSubscribe={showNotification} />
    </div>
  )
}

export default App
