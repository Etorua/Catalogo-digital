import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext.jsx'
import { Star, Heart } from 'lucide-react'

function ProductDetails({ onNotify }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
      addToCart(product, quantity);
      onNotify('Producto agregado al carrito', 'success');
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

  if (loading) return <div>Cargando...</div>
  if (!product) return <div>Producto no encontrado</div>

  return (
    <div className="product-details-container">
      <Link to="/" className="back-link">Volver al listado</Link>
      
      <div className="details-grid">
        <div className="image-gallery">
            <div className="image-stage">
                                 <img
                                     src={getImageUrl(product.images)}
                                     alt={product.title}
                                     className="main-image"
                                     onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/600x400/efefef/333.png&text=Sin+Imagen'; }}
                                 />
            </div>
            
            <div className="description-section">
                <h3>Descripción</h3>
                <p className="description">{product.description}</p>
                
                 <div className="specs">
                    <h3>Características principales</h3>
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                        <tbody>
                            {product.specs && Object.entries(product.specs).map(([key, val]) => (
                                <tr key={key} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding: '10px', background: '#ebebeb', width: '30%', fontWeight: '600'}}>{key}</td>
                                    <td style={{padding: '10px'}}>{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div className="info-panel">
            <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
            <div className="sku-header" style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px'}}>
                 <span style={{fontSize:'12px', fontWeight:'bold'}}>SKU:</span>
                 <span className="sku" style={{fontSize:'12px', color:'#666'}}>{product.sku}</span>
                 <div style={{display:'flex', gap:'2px', alignItems: 'center'}}>
                    {[...Array(4)].map((_, i) => <Star key={i} size={14} fill="#f96302" color="#f96302" />)}
                    <Star size={14} color="#f96302" />
                    <span style={{fontSize:'12px', color:'#0284c7', marginLeft:'5px'}}>(24 Opiniones)</span>
                 </div>
            </div>
            
            <div className="price-box">
                <span className="current-price">$ {product.price_base.toLocaleString()}</span>
                <span style={{fontSize:'14px', verticalAlign:'top', marginLeft:'5px'}}>c/u</span>
            </div>

            <div className="fulfillment-box" style={{border:'1px solid #ddd', padding:'20px', marginBottom:'20px', background:'#fff'}}>
                <div style={{marginBottom: '15px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                    <input type="radio" name="fulfillment" defaultChecked style={{marginTop:'5px'}} /> 
                    <div>
                        <strong style={{display:'block', marginBottom:'2px'}}>Envío Programado</strong>
                        <span style={{fontSize: '12px', color: '#666'}}>Disponible para envío a CP 11000</span>
                    </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px', opacity: product.stock > 0 ? 1 : 0.6}}>
                    <input type="radio" name="fulfillment" disabled={product.stock <= 0} style={{marginTop:'5px'}} /> 
                    <div>
                        <strong style={{display:'block', marginBottom:'2px'}}>Retiro en Tienda</strong>
                        <span style={{fontSize: '13px', fontWeight:'700', color: product.stock > 0 ? '#166534' : '#dc2626'}}>
                            {product.stock > 0 ? `Stock: ${product.stock} Unidades` : 'No disponible en tienda seleccionada'}
                        </span>
                        {product.stock > 0 && <div style={{fontSize:'11px', color:'#666', marginTop:'2px'}}>Pasillo 14, Bahía 02</div>}
                    </div>
                </div>
            </div>

            <div className="actions">
                <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                    <input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        style={{width:'60px', padding:'10px', textAlign:'center', border:'1px solid #ccc', fontWeight:'bold'}} 
                    />
                    <button onClick={handleAddToCart} className="primary-btn" disabled={product.stock <= 0} style={{flexGrow: 1, backgroundColor: '#f96302', color: 'white', border: 'none', fontWeight: 'bold'}}>
                        Agregar al Carrito
                    </button>
                </div>
                 <button className="secondary-btn" style={{width: '100%', padding: '12px', cursor: 'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}} onClick={() => onNotify && onNotify('Producto guardado en tu lista de deseos', 'success')}>
                    <Heart size={20} /> Guardar en Mi Lista
                </button>
            </div>

            
            <div className="seller-info" style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                     <div style={{width:'40px', height:'40px', background:'#f96302', borderRadius:'50%', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>P</div>
                     <div>
                        <p style={{fontSize: '12px', fontWeight:'bold', margin:0}}>Garantía PRO Center</p>
                        <p style={{fontSize: '11px', color: '#666', margin:0}}>Devoluciones gratis en tienda por 90 días.</p>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
