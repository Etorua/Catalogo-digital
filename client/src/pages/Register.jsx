import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Briefcase, Mail, Lock, Phone, User, FileText, MapPin, CreditCard } from 'lucide-react';

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
        cfdi_use: 'G03' // Gastos en general default
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

    return (
        <div className="login-page">
             <div className="login-bg-pattern"></div>
             
             <div className="login-container" style={{maxWidth: '1000px'}}>
                {/* Left Side (Info) */}
                <div className="login-left">
                    <h1 style={{fontSize: '32px', fontWeight: '800', marginBottom: '10px'}}>
                        PORTAL<br/>CLIENTES
                    </h1>
                    <p style={{fontSize: '16px', opacity: '0.9', marginBottom: '30px', maxWidth: '400px'}}>
                        Gestiona tus pedidos y facturación en un solo lugar.
                    </p>
                    
                    <div style={{marginTop: '40px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px', opacity: step===1?1:0.5}}>
                            <div style={{width:'30px', height:'30px', borderRadius:'50%', background:'white', color:'var(--primary-color)', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center'}}>1</div>
                            <span style={{fontWeight:'bold'}}>Datos de Acceso</span>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', opacity: step===2?1:0.5}}>
                            <div style={{width:'30px', height:'30px', borderRadius:'50%', background:'white', color:'var(--primary-color)', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center'}}>2</div>
                            <span style={{fontWeight:'bold'}}>Información Fiscal</span>
                        </div>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="login-right">
                    <div className="login-form-wrapper" style={{width: '100%'}}>
                        <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'white'}}>
                            {step === 1 ? 'Crear Cuenta' : 'Datos de Facturación'}
                        </h2>
                        
                        {error && <div style={{background: 'rgba(220, 38, 38, 0.2)', color: '#fecaca', border:'1px solid rgba(220, 38, 38, 0.5)', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            
                            {/* STEP 1: ACCOUNT INFO */}
                            {step === 1 && (
                                <div style={{display: 'grid', gap: '15px'}}>
                                    <div className="input-group">
                                        <label>Nombre de Contacto</label>
                                        <div className="input-with-icon">
                                            <User size={18} />
                                            <input name="full_name" placeholder="Ej. Juan Pérez" required value={formData.full_name} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Correo Electrónico</label>
                                        <div className="input-with-icon">
                                            <Mail size={18} />
                                            <input name="email" type="email" placeholder="cliente@empresa.com" required value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Teléfono / WhatsApp</label>
                                        <div className="input-with-icon">
                                            <Phone size={18} />
                                            <input name="phone" placeholder="(000) 000-0000" required value={formData.phone} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Contraseña</label>
                                        <div className="input-with-icon">
                                            <Lock size={18} />
                                            <input name="password" type="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <button type="button" onClick={() => setStep(2)} className="primary-btn" style={{width: '100%', padding: '12px', marginTop: '10px', justifyContent: 'center'}}>
                                        Siguente: Datos Fiscales →
                                    </button>
                                </div>
                            )}

                            {/* STEP 2: FISCAL INFO */}
                            {step === 2 && (
                                <div style={{display: 'grid', gap: '15px'}}>
                                    
                                    <div style={{display:'flex', gap:'10px', background:'rgba(255,255,255,0.1)', padding:'5px', borderRadius:'6px', marginBottom:'10px'}}>
                                        <button type="button" 
                                            onClick={() => setFormData({...formData, person_type: 'fisica'})}
                                            className={`gender-toggle-btn ${formData.person_type === 'fisica' ? 'active' : ''}`}>
                                            👤 Persona Física
                                        </button>
                                        <button type="button" 
                                            onClick={() => setFormData({...formData, person_type: 'moral'})}
                                            className={`gender-toggle-btn ${formData.person_type === 'moral' ? 'active' : ''}`}>
                                            🏢 Persona Jurídica
                                        </button>
                                    </div>

                                    <div className="input-group">
                                        <label>{formData.person_type === 'moral' ? 'Razón Social' : 'Nombre Completo (Fiscal)'}</label>
                                        <div className="input-with-icon">
                                            <Briefcase size={18} />
                                            <input name="legal_name" placeholder={formData.person_type === 'moral' ? "Ej. Soluciones Integrales SA de CV" : "Ej. Juan Pérez López"} required value={formData.legal_name} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                        <div className="input-group">
                                            <label>RFC</label>
                                            <div className="input-with-icon">
                                                <FileText size={18} />
                                                <input name="rfc" placeholder="XEXX010101000" required value={formData.rfc} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Código Postal</label>
                                            <div className="input-with-icon">
                                                <MapPin size={18} />
                                                <input name="zip_code" placeholder="00000" required value={formData.zip_code} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    {formData.person_type === 'fisica' && (
                                        <div className="input-group">
                                            <label>CURP</label>
                                            <div className="input-with-icon">
                                                <User size={18} />
                                                <input name="curp" placeholder="Clave Única..." value={formData.curp} onChange={handleChange} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="input-group">
                                        <label>Régimen Fiscal</label>
                                        <div className="input-with-icon" style={{padding:0}}>
                                            <select name="fiscal_regime" style={{width:'100%', border:'none', background:'transparent', padding:'12px', color:'white'}} value={formData.fiscal_regime} onChange={handleChange}>
                                                <option value="">Seleccionar Régimen...</option>
                                                <option value="601">601 - General de Ley Personas Morales</option>
                                                <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                                                <option value="626">626 - Régimen Simplificado de Confianza</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Dirección Fiscal</label>
                                        <div className="input-with-icon">
                                            <MapPin size={18} />
                                            <input name="fiscal_address" placeholder="Calle, Número, Colonia, Ciudad" required value={formData.fiscal_address} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                        <button type="button" onClick={() => setStep(1)} className="secondary-btn" style={{flex:1, background: 'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)'}}>
                                            ← Atrás
                                        </button>
                                        <button type="submit" className="primary-btn" style={{flex:2, justifyContent:'center'}}>
                                            <UserPlus size={18} /> Finalizar Registro
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>

                        <div style={{marginTop: '20px', fontSize: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.7)'}}>
                            ¿Ya tienes cuenta? <Link to="/login" style={{color: 'white', fontWeight: 'bold', textDecoration:'underline'}}>Inicia Sesión</Link>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}

export default Register;
