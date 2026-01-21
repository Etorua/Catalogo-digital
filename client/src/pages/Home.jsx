import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext.jsx'

function Home({ onNotify }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 })
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()

    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)
    const [selectedStore, setSelectedStore] = useState(null)

  // Filtros Avanzados
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('')
  const [inStock, setInStock] = useState(false)
  const [page, setPage] = useState(1)

    const stores = [
        { id: 1, name: 'COAPA MIRAMONTES #8744', status: 'Abierto', hours: 'Cierra a las 10:00 p.m.', address: 'Av. Canal de Miramontes #2053, Col. De los Girasoles, Del. Coyoacán, C.P. 04920', phone: '(55) 5483 3900' },
        { id: 2, name: 'CENTRO #8860', status: 'Abierto', hours: 'Cierra a las 10:00 p.m.', address: 'Av. Del Taller #370, Col. 24 de Abril, Del. Venustiano Carranza, C.P. 15980', phone: '(55) 5036 1100' },
        { id: 3, name: 'COAPA DEL HUESO #8702', status: 'Abierto', hours: 'Cierra a las 10:00 p.m.', address: 'Calzada del Hueso #670, Col. Los Robles, Del. Coyoacán, C.P. 04870', phone: '(55) 5624 1400' },
        { id: 4, name: 'COPILCO #8691', status: 'Abierto', hours: 'Cierra a las 10:00 p.m.', address: 'Eje 10 #546, Col. Los Reyes en Coyoacán, C.P. 04330', phone: '(55) 5338 0900' },
        { id: 5, name: 'IZTAPALAPA #8747', status: 'Abierto', hours: 'Cierra a las 10:00 p.m.', address: 'Calz. Ermita Iztapalapa #2891, Col. Iztapalapa, C.P. 09310', phone: '(55) 9123 0000' }
    ]

    const promotions = [
        { id: 1, title: 'Pisos', tag: 'Hasta 15% de ahorro', image: 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop' },
        { id: 2, title: 'Baños', tag: 'Hasta 40% de ahorro', image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?q=80&w=1200&auto=format&fit=crop' },
        { id: 3, title: 'Calentadores de Agua', tag: 'Hasta 25% de ahorro', image: 'https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1200&auto=format&fit=crop' },
        { id: 4, title: 'Refrigeradores', tag: 'Hasta 45% de ahorro', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop' },
        { id: 5, title: 'Lavandería', tag: 'Hasta 45% de ahorro', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop' },
        { id: 6, title: 'Cajas', tag: '4x3', image: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1200&auto=format&fit=crop' },
        { id: 7, title: 'Herramientas', tag: 'Producto gratis', image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=1200&auto=format&fit=crop' },
        { id: 8, title: 'Pintura', tag: 'Producto gratis', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop' }
    ]

  const query = searchParams.get('q') || ''
  const category = searchParams.get('cat') || ''

  useEffect(() => {
    setLoading(true)
    
    // Construir Query String
    const params = new URLSearchParams({
        search: query,
        category: category,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sort,
        inStock: inStock,
        page: page,
        limit: 9
    }).toString();

    // Cargar productos y categorías en paralelo
    Promise.all([
        axios.get(`/api/products?${params}`),
        axios.get('/api/categories')
    ]).then(([resProducts, resCats]) => {
        setProducts(resProducts.data.data) // Datos paginados
        setPagination(resProducts.data.pagination) // Metadatos
        setCategories(resCats.data)
        setLoading(false)
    }).catch(err => {
        console.error("Error", err)
        setLoading(false)
    })
  }, [query, category, minPrice, maxPrice, sort, inStock, page])

  const handleCategory = (cat) => {
    setSearchParams({ q: query, cat: cat === category ? '' : cat });
    setPage(1); // Reset page on filter change
  }
  
  // Reset pagination when filters change via sidebar
  const handlePriceChange = (setter, value) => {
      setter(value);
      setPage(1);
  }

  const handleAddToCartClick = (product) => {
    addToCart(product);
    if(onNotify) onNotify('Producto agregado al carrito', 'success');
  }

    const getImageUrl = (images) => {
        if (Array.isArray(images) && images.length > 0) return images[0];
        if (typeof images === 'string' && images) {
            if (images.startsWith('{') && images.endsWith('}')) {
                const first = images.slice(1, -1).split(',')[0];
                return first || 'https://dummyimage.com/600x400/efefef/333.png&text=Producto';
            }
            return images;
        }
        return 'https://dummyimage.com/600x400/efefef/333.png&text=Producto';
    }

  return (
    <div style={{width: '100%'}}>

            {/* Banner Promocional Superior */}
            <div className="promo-strip">
                <img
                    src="https://images.unsplash.com/photo-1512446733611-9099a758e0e2?q=80&w=1600&auto=format&fit=crop"
                    alt="Promoción bancaria"
                />
                <div className="promo-strip-text">
                    15% de bonificación con tarjeta digital · 10% con tarjeta física · Compra hoy y paga en abril 2026
                </div>
            </div>

            {/* Localizador de Tienda */}
            <div className="store-locator-banner">
                <div>
                    <strong>Localiza tu tienda más cercana</strong>
                    <div style={{fontSize: '12px', color: '#666'}}>Elige tu ubicación para ver disponibilidad y tiempos de entrega</div>
                </div>
                <button className="primary-btn" onClick={() => setIsStoreModalOpen(true)}>
                    {selectedStore ? `Tienda: ${selectedStore.name}` : 'Elegir tienda'}
                </button>
            </div>

      {/* Hero Banner Style Home Depot */}
      <div className="hero-carousel" style={{
          width: '100%', 
          height: '320px', 
          background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
      }}>
          {/* Orange Deco Blocks */}
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
               {[...Array(8)].map((_, i) => (
                   <div key={i} style={{height: '40px', background: i%2===0 ? '#f96302' : 'transparent', width: i%3===0 ? '60px' : '100px', opacity: 0.8}}></div>
               ))}
          </div>

          {/* Main Content */}
          <div style={{textAlign: 'center', color: 'white', zIndex: 2}}>
                <h2 style={{
                    fontSize: '60px', 
                    fontStyle: 'italic', 
                    fontWeight: '900', 
                    lineHeight: '0.9', 
                    textTransform: 'uppercase',
                    margin: 0,
                    textShadow: '0 5px 15px rgba(0,0,0,0.5)',
                    fontFamily: 'Arial Black, Gadget, sans-serif',
                    letterSpacing: '-2px'
                }}>
                    SOMOS<br/>
                    <span style={{
                        color: 'transparent', 
                        WebkitTextStroke: '2px white',
                    }}>ORGULLOSOS</span><br/>
                    PROVEEDORES
                </h2>
                
                <div className="hero-announcement">
                  Compra ahora y paga en abril 2026 · Promociones bancarias vigentes
                </div>

                <div style={{marginTop: '25px', display: 'inline-flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '50px', border: '1px solid #555'}}>
                     <div style={{background: '#f96302', padding: '5px', borderRadius: '4px'}}>
                        <span style={{fontWeight: '900', fontSize: '14px'}}>PRO CENTER</span>
                     </div>
                     <span style={{fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px'}}>SUMINISTRANDO EL FUTURO 2026</span>
                </div>
          </div>

          <div style={{position:'absolute', right: '50px', bottom: '40px', display: 'flex', alignItems: 'center', gap: '15px'}}>
               <div style={{background: '#f96302', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px'}}>
                  <span style={{fontSize: '30px'}}>⬇</span>
               </div>
               <span style={{color: 'white', fontWeight: 'bold', fontSize: '20px', textShadow: '2px 2px 4px black', textTransform: 'uppercase'}}>
                   Descarga<br/>Nuestro Catálogo
               </span>
          </div>
      </div>

            {/* Promociones */}
            <div style={{margin: '10px 0 30px'}}>
                <h2 style={{margin: '0 0 15px', fontSize: '18px'}}>Las Mejores Promociones</h2>
                <div className="promos-grid">
                    {promotions.map(promo => (
                        <div className="promo-card" key={promo.id}>
                            <div className="promo-badge">{promo.tag}</div>
                            <img src={promo.image} alt={promo.title} />
                            <div className="promo-title">{promo.title}</div>
                        </div>
                    ))}
                </div>
            </div>

     <div style={{display: 'flex', gap: '30px', alignItems: 'flex-start'}}>
      
      {/* Sidebar de Filtros */}
      <aside className="filters-sidebar" style={{width: '240px', flexShrink: 0, background: '#f8f9fa', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px'}}>
         
         {/* Filtro Categorias */}
         <div style={{marginBottom: '20px'}}>
             <h3 style={{fontSize: '14px', fontWeight: '800', marginBottom: '15px', color: '#111', textTransform: 'uppercase', borderBottom: '2px solid #ddd', paddingBottom: '5px'}}>Departamento</h3>
             <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                 <li style={{marginBottom: '8px'}}>
                    <button 
                        className={category === '' ? 'filter-link active' : 'filter-link'} 
                        onClick={() => handleCategory('')}
                        style={{background:'none', border:'none', cursor:'pointer', color: category==='' ? '#f96302' : '#333', textAlign:'left', padding:0, fontWeight: category===''?'700':'400', fontSize:'13px'}}>
                        Todo el Catálogo
                    </button>
                 </li>
                 {categories.map(cat => (
                     <li key={cat.name} style={{marginBottom: '8px'}}>
                        <button 
                            className={category === cat.name ? 'filter-link active' : 'filter-link'} 
                            onClick={() => handleCategory(cat.name)}
                            style={{background:'none', border:'none', cursor:'pointer', color: category===cat.name ? '#f96302' : '#333', textAlign:'left', padding:0, fontWeight: category===cat.name?'700':'400', fontSize:'13px'}}>
                            {cat.name} <span style={{fontSize: '11px', color: '#888'}}>({cat.count})</span>
                        </button>
                     </li>
                 ))}
             </ul>
         </div>

            {isStoreModalOpen && (
                <div className="store-modal-overlay" onClick={() => setIsStoreModalOpen(false)}>
                    <div className="store-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="store-modal-header">
                            <h3>Elige una tienda</h3>
                            <button className="store-modal-close" onClick={() => setIsStoreModalOpen(false)}>×</button>
                        </div>
                        <div className="store-modal-body">
                            {stores.map(store => (
                                <div key={store.id} className="store-card">
                                    <div className="store-title">{store.name}</div>
                                    <div className="store-status">{store.status} · {store.hours}</div>
                                    <div className="store-address">{store.address}</div>
                                    <div className="store-actions">
                                        <span className="store-phone">{store.phone}</span>
                                        <button
                                            className={selectedStore?.id === store.id ? 'store-select active' : 'store-select'}
                                            onClick={() => {
                                                setSelectedStore(store)
                                                setIsStoreModalOpen(false)
                                                if (onNotify) onNotify('Tienda seleccionada', 'success')
                                            }}
                                        >
                                            {selectedStore?.id === store.id ? 'Tienda seleccionada' : 'Seleccionar tienda'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

         {/* Filtro Precio */}
         <div style={{marginBottom: '20px'}}>
             <h3 style={{fontSize: '14px', fontWeight: '800', marginBottom: '15px', color: '#111', textTransform: 'uppercase', borderBottom: '2px solid #ddd', paddingBottom: '5px'}}>Precio</h3>
             <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                 <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => handlePriceChange(setMinPrice, e.target.value)}
                    style={{width: '100%', padding: '5px', border:'1px solid #ccc', borderRadius:'4px'}}
                 />
                 <span style={{color:'#999'}}>-</span>
                 <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(setMaxPrice, e.target.value)}
                    style={{width: '100%', padding: '5px', border:'1px solid #ccc', borderRadius:'4px'}}
                 />
             </div>
         </div>

         {/* Filtro Disponibilidad */}
         <div style={{marginBottom: '20px'}}>
             <h3 style={{fontSize: '14px', fontWeight: '800', marginBottom: '15px', color: '#111', textTransform: 'uppercase', borderBottom: '2px solid #ddd', paddingBottom: '5px'}}>Disponibilidad</h3>
             <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                 <input 
                    type="checkbox" 
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    style={{accentColor: '#f96302'}}
                 />
                 <span style={{fontSize:'13px'}}>Solo en existencia en Tienda</span>
             </label>
         </div>

         <button onClick={() => {setMinPrice(''); setMaxPrice(''); setInStock(false); handleCategory('');}} style={{width:'100%', padding:'8px', background:'white', border:'1px solid #666', borderRadius:'4px', cursor: 'pointer', fontSize:'12px'}}>
             Limpiar Filtros
         </button>
      </aside>

      <main style={{flexGrow: 1}}>
        {/* Breadcrumb + Sort */}
        <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
             <div style={{fontSize: '14px', color: '#64748b'}}>
                  <span style={{fontWeight: '700', color: '#333'}}>{products.length} Resultados</span> 
                  {category && <span> en "{category}"</span>}
                  {query && <span> para "{query}"</span>}
             </div>
             
             <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <span style={{fontSize:'13px'}}>Ordenar por:</span>
                 <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value)}
                    style={{padding:'5px', borderRadius:'4px', border:'1px solid #ccc'}}
                 >
                     <option value="">Relevancia</option>
                     <option value="price_asc">Precio: Menor a Mayor</option>
                     <option value="price_desc">Precio: Mayor a Menor</option>
                     <option value="name_asc">Nombre: A-Z</option>
                 </select>
             </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'50px'}}>
              <div style={{fontSize:'30px', marginBottom:'10px'}}>↻</div>
              <p>Actualizando resultados...</p>
          </div>
        ) : products.length === 0 ? (
            <div style={{textAlign:'center', padding:'50px', background:'#f8f9fa', borderRadius:'8px'}}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>🔍</div>
                <h3>No encontramos productos</h3>
                <p>Intenta ajustar tus filtros de búsqueda.</p>
            </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} style={{textDecoration: 'none'}}>
                  <div className="product-card">
                                        <div className="image-placeholder" style={{padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <img
                                                src={getImageUrl(product.images)}
                                                alt={product.title}
                                                style={{width: '100%', height: '200px', objectFit: 'contain'}}
                                                onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/600x400/efefef/333.png&text=Sin+Imagen'; }}
                                            />
                                        </div>
                    <div className="card-content">
                        <h3>{product.title}</h3>
                        <div style={{marginTop: 'auto'}}>
                            <p className="price">
                                $ {product.price_base.toLocaleString()}
                                <span style={{display:'block', fontSize: '10px', fontWeight: 'normal', color: '#666'}}>Precio Internet</span>
                            </p>
                            
                            <div className="stock-indicator-sml">
                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                    <span>🚚</span> <span style={{fontSize:'12px', color:'#333'}}>Envío Estándar</span>
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                    <span>🏪</span> <span style={{fontSize:'12px', color: product.stock>0?'#166534':'#dc2626', fontWeight:'600'}}>
                                        {product.stock > 0 ? 'Retiro en Tienda' : 'Agotado en Tienda'}
                                    </span>
                                </div>
                                <button 
                                    className="primary-btn" 
                                    style={{marginTop:'15px', width:'100%', fontSize:'14px', padding:'10px'}}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddToCartClick(product);
                                    }}
                                >
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '40px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="secondary-btn"
                    style={{padding: '5px 10px', fontSize: '13px'}}
                >
                    Anterior
                </button>
                
                {(() => {
                    const maxButtons = 5;
                    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
                    let endPage = startPage + maxButtons - 1;

                    if (endPage > pagination.totalPages) {
                        endPage = pagination.totalPages;
                        startPage = Math.max(1, endPage - maxButtons + 1);
                    }

                    const buttons = [];

                    if (startPage > 1) {
                         buttons.push(
                            <button key={1} onClick={() => setPage(1)} className="secondary-btn" style={{ width: '35px', padding: 0 }}>1</button>
                        );
                        if (startPage > 2) buttons.push(<span key="dots1" style={{alignSelf:'center'}}>...</span>);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                        buttons.push(
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={page === i ? "primary-btn" : "secondary-btn"}
                                style={{ width: '35px', padding: '0', fontSize: '13px' }}
                            >
                                {i}
                            </button>
                        );
                    }

                    if (endPage < pagination.totalPages) {
                        if (endPage < pagination.totalPages - 1) buttons.push(<span key="dots2" style={{alignSelf:'center'}}>...</span>);
                        buttons.push(
                            <button key={pagination.totalPages} onClick={() => setPage(pagination.totalPages)} className="secondary-btn" style={{ width: '35px', padding: 0 }}>{pagination.totalPages}</button>
                        );
                    }

                    return buttons;
                })()}

                <button 
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className="secondary-btn"
                    style={{padding: '5px 10px', fontSize: '13px'}}
                >
                    Siguiente
                </button>
            </div>
        )}
      </main>
    </div>
   </div>
  )
}

export default Home
