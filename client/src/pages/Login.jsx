import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res.data.success) {
                onLogin(res.data.user);
                navigate('/admin'); // Redirigir al panel admin
            }
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="login-page">
            <Link to="/" style={{
                position: 'absolute', 
                top: '30px', 
                left: '30px', 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                zIndex: 10, 
                fontSize: '14px',
                transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateX(-5px)'}}
            onMouseOut={(e) => {e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateX(0)'}}
            >
                <ArrowLeft size={18} /> Volver al Catálogo
            </Link>

            <div className="login-bg-pattern"></div>
            
            <div className="login-container">
                {/* Left Side: Branding */}
                <div className="login-left">
                    <h1 style={{fontSize: '42px', fontWeight: '800', marginBottom: '10px', lineHeight: '1.1'}}>
                        CATÁLOGO DIGITAL<br/>CORPORATIVO
                    </h1>
                    <p style={{fontSize: '18px', opacity: '0.9', marginBottom: '40px', maxWidth: '500px'}}>
                        Sistema interno para la gestión integral de productos, inventarios y campañas de marketing. 
                        Control eficiente de recursos para optimizar la experiencia del cliente.
                    </p>
                    <div style={{letterSpacing: '2px', fontSize: '14px', opacity: '0.7'}}>
                        SISTEMA INTEGRAL DE ADMINISTRACIÓN
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="login-right">
                    <div className="login-form-wrapper">
                        <div style={{
                            width: '80px', height: '80px', border: '2px solid white', borderRadius: '50%', 
                            margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        
                        <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '40px', letterSpacing: '1px'}}>
                            INICIAR SESIÓN
                        </h2>

                        {error && <div style={{background: 'rgba(255,0,0,0.2)', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize:'14px'}}>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div style={{textAlign: 'left'}}>
                                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Correo electrónico</label>
                                <input 
                                    className="login-input"
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div style={{textAlign: 'left', position: 'relative'}}>
                                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Contraseña</label>
                                <input 
                                    className="login-input"
                                    type={showPassword ? "text" : "password"}
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <span 
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{position: 'absolute', right: 0, bottom: '35px', cursor: 'pointer', opacity: 0.7}}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </span>
                            </div>

                            <button type="submit" className="btn-white">
                                Iniciar sesión
                            </button>
                            
                            <div style={{marginTop: '20px', fontSize: '14px', opacity: '0.9', display: 'flex', justifyContent: 'center'}}>
                                <span style={{cursor:'pointer', textDecoration:'underline'}}>Recuperar Contraseña</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
