import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Briefcase, Mail, Lock, Phone, User, FileText, MapPin, CheckCircle } from 'lucide-react';

function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Datos Cuenta, 2: Datos Fiscales
    const [formData, setFormData] = useState({
        // Cuenta
        full_name: '',
        email: '',
        password: '',
        phone: '',
        
        // Fiscal
        person_type: 'fisica', // fisica | moral
        legal_name: '', // Razón Social
        rfc: '',
        curp: '',
        fiscal_regime: '',
        zip_code: '',
        fiscal_address: '',
        city: '',
        cfdi_use: 'G03'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/auth/register', formData);
            if (res.data.success) {
                alert('Registro exitoso. Se ha creado tu cuenta con perfil de facturación.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al registrar usuario');
        }
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // Estilos inline reutilizables
    const inputStyle = {
        width: '100%',
        padding: '12px 12px 12px 40px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        outline: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s'
    };
    
    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '600',
        fontSize: '13px',
        color: '#444'
    };

    const iconStyle = {
        position: 'absolute',
        left: '12px',
        top: '38px', // Ajustado para alinearse con input
        color: '#94a3b8'
    };

    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '1rem' }}>Crea tu Cuenta Profesional</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    Regístrate para gestionar tus pedidos, facturación y obtener precios especiales de mayoreo.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
                
                {/* Lateral Informativo */}
                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#f96302', marginBottom: '1.5rem' }}>Beneficios de ser Cliente</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                            <CheckCircle size={20} color="#16a34a" />
                            <div>
                                <strong>Facturación Automática</strong>
                                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>Genera tus facturas al instante con tus datos guardados.</p>
                            </div>
                        </li>
                        <li style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                            <CheckCircle size={20} color="#16a34a" />
                            <div>
                                <strong>Historial de Compras</strong>
                                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>Consulta tus pedidos anteriores y reordena fácilmente.</p>
                            </div>
                        </li>
                        <li style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                            <CheckCircle size={20} color="#16a34a" />
                            <div>
                                <strong>Precios Especiales</strong>
                                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>Acceso a descuentos por volumen y promociones exclusivas.</p>
                            </div>
                        </li>
                    </ul>
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>¿Ya tienes cuenta?</p>
                        <Link to="/login" className="secondary-btn" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px', textDecoration: 'none' }}>
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>

                {/* Formulario */}
                <div style={{ background: 'white', padding: '0', borderRadius: '8px' }}>
                    
                    {/* Stepper */}
                    <div style={{ display: 'flex', marginBottom: '2rem', position: 'relative' }}>
                        <div style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '30px', height: '30px', background: step >= 1 ? '#f96302' : '#e2e8f0', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>1</div>
                            <span style={{ fontSize: '13px', fontWeight: step >= 1 ? 'bold' : 'normal', color: step >= 1 ? '#333' : '#999' }}>Datos de Acceso</span>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '30px', height: '30px', background: step >= 2 ? '#f96302' : '#e2e8f0', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>2</div>
                            <span style={{ fontSize: '13px', fontWeight: step >= 2 ? 'bold' : 'normal', color: step >= 2 ? '#333' : '#999' }}>Información Fiscal</span>
                        </div>
                        <div style={{ position: 'absolute', top: '15px', left: '25%', right: '25%', height: '2px', background: '#e2e8f0', zIndex: 0 }}>
                            <div style={{ width: step === 2 ? '100%' : '0%', height: '100%', background: '#f96302', transition: 'width 0.3s' }}></div>
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span style={{fontSize:'1.2rem'}}>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        {/* PASO 1 */}
                        {step === 1 && (
                            <div className="fade-in">
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Configuración de la Cuenta</h2>
                                
                                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <label style={labelStyle}>Nombre Completo de Contacto</label>
                                    <User size={18} style={iconStyle} />
                                    <input name="full_name" placeholder="Ej. Juan Pérez" required value={formData.full_name} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <label style={labelStyle}>Correo Electrónico</label>
                                    <Mail size={18} style={iconStyle} />
                                    <input name="email" type="email" placeholder="cliente@empresa.com" required value={formData.email} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}>Teléfono / Celular</label>
                                        <Phone size={18} style={iconStyle} />
                                        <input name="phone" placeholder="(000) 000-0000" required value={formData.phone} onChange={handleChange} style={inputStyle} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}>Contraseña</label>
                                        <Lock size={18} style={iconStyle} />
                                        <input name="password" type="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <button type="button" onClick={() => setStep(2)} className="primary-btn" style={{ padding: '12px 30px', fontSize: '1rem' }}>
                                        Siguiente Paso →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PASO 2 */}
                        {step === 2 && (
                            <div className="fade-in">
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Datos de Facturación</h2>
                                
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', background: '#f1f5f9', padding: '5px', borderRadius: '8px', width: 'fit-content' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, person_type: 'fisica'})}
                                        style={{
                                            border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                                            background: formData.person_type === 'fisica' ? 'white' : 'transparent',
                                            color: formData.person_type === 'fisica' ? '#0f172a' : '#64748b',
                                            boxShadow: formData.person_type === 'fisica' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        👤 Persona Física
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, person_type: 'moral'})}
                                        style={{
                                            border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                                            background: formData.person_type === 'moral' ? 'white' : 'transparent',
                                            color: formData.person_type === 'moral' ? '#0f172a' : '#64748b',
                                            boxShadow: formData.person_type === 'moral' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        🏢 Persona Moral
                                    </button>
                                </div>

                                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <label style={labelStyle}>{formData.person_type === 'moral' ? 'Razón Social' : 'Nombre Completo (Fiscal)'}</label>
                                    <Briefcase size={18} style={iconStyle} />
                                    <input name="legal_name" placeholder={formData.person_type === 'moral' ? "Ej. Constructora del Norte SA de CV" : "Ej. Juan Pérez López"} required value={formData.legal_name} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}>RFC</label>
                                        <FileText size={18} style={iconStyle} />
                                        <input name="rfc" placeholder="XEXX010101000" required value={formData.rfc} onChange={handleChange} style={inputStyle} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}>Código Postal</label>
                                        <MapPin size={18} style={iconStyle} />
                                        <input name="zip_code" placeholder="00000" required value={formData.zip_code} onChange={handleChange} style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={labelStyle}>Régimen Fiscal</label>
                                    <select 
                                        name="fiscal_regime" 
                                        value={formData.fiscal_regime} 
                                        onChange={handleChange}
                                        style={{...inputStyle, paddingLeft: '12px'}}
                                    >
                                        <option value="">Seleccionar Régimen...</option>
                                        <option value="601">601 - General de Ley Personas Morales</option>
                                        <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                                        <option value="626">626 - Régimen Simplificado de Confianza</option>
                                        <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '2rem', position: 'relative' }}>
                                    <label style={labelStyle}>Dirección Fiscal Completa</label>
                                    <MapPin size={18} style={iconStyle} />
                                    <input name="fiscal_address" placeholder="Calle, Número, Colonia, Ciudad, Estado" required value={formData.fiscal_address} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setStep(1)} className="secondary-btn" style={{ padding: '12px 20px' }}>
                                        ← Volver
                                    </button>
                                    <button type="submit" className="primary-btn" style={{ padding: '12px 30px', fontSize: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <UserPlus size={20} /> Crear Cuenta
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
