import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, Smile, Clock } from 'lucide-react';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isBusinessOpen, setIsBusinessOpen] = useState(true);
    const [messages, setMessages] = useState([
        { id: 1, text: "¡Hola! 👋 Bienvenido a nuestro soporte en línea. ¿En qué podemos ayudarte hoy?", sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);
    const [showOptions, setShowOptions] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    
    // Configuración de Agentes (Simulación de sistema de colas)
    // En un sistema real, esto vendría de una API que revisa el estado "En Línea" de cada agente
    const agents = [
        { name: 'Ana', phone: '526622028681' }, 
        { name: 'Carlos', phone: '526622028681' },
        { name: 'Soporte', phone: '526622028681' }
    ];

    const quickActions = [
        { id: 'stock', text: '📦 Consultar Existencias' },
        { id: 'order', text: '🚚 Estado de mi Pedido' },
        { id: 'quote', text: '📄 Solicitar Cotización' },
        { id: 'human', text: '👤 Hablar con un Asesor' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Check Business Hours (L-V 8am-7pm | Sat 9am-2pm)
    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            // Lunes(1) a Viernes(5): 8:00 - 19:00 (7pm)
            // Sabado(6): 9:00 - 14:00 (2pm)
            const isWeekday = day >= 1 && day <= 5;
            const isSaturday = day === 6;
            
            let open = false;
            if (isWeekday && hour >= 8 && hour < 19) open = true;
            if (isSaturday && hour >= 9 && hour < 14) open = true;
            
            setIsBusinessOpen(open);
        };
        
        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    // Función inteligente para asignar agente
    const connectToSmartAgent = (contextMessage) => {
        setIsTyping(true);
        
        // 1. Simular tiempo de búsqueda en la red
        setTimeout(() => {
            // Eliminar indicador de typing previo para poner mensaje de sistema
            setIsTyping(false);
            
            setMessages(prev => [...prev, { 
                id: Date.now(), 
                text: "🔎 Verificando disponibilidad de asesores...", 
                sender: 'bot', 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            }]);
            
            setIsTyping(true);

            // 2. Simular asignación
            setTimeout(() => {
                // Elegir agente al azar (load balancing simulación)
                const randomAgent = agents[Math.floor(Math.random() * agents.length)];
                
                setIsTyping(false);
                setMessages(prev => [...prev, { 
                    id: Date.now() + 1, 
                    text: `✅ Conectado. Te atenderá ${randomAgent.name}.`, 
                    sender: 'bot', 
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                }]);

                // 3. Ejecutar redirección
                setTimeout(() => {
                    const url = `https://wa.me/${randomAgent.phone}?text=${encodeURIComponent(contextMessage)}`;
                    
                    // Agregar botón manual por si falla el popup automático
                    setMessages(prev => [...prev, { 
                         id: Date.now() + 2, 
                         text: "Clic aquí para ir a WhatsApp", 
                         isAction: true,
                         url: url,
                         sender: 'bot', 
                         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                    }]);

                    // Intentar abrir automáticamente
                    window.open(url, '_blank');
                }, 1000);

            }, 1500);
        }, 1000);
    };

    const handleOptionClick = (option) => {
        // Enviar selección como mensaje del usuario
        const userMsg = { id: Date.now(), text: option.text, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        setMessages(prev => [...prev, userMsg]);
        setShowOptions(false);
        setIsTyping(true);

        setTimeout(() => {
            let botResponse = "";

            switch(option.id) {
                case 'stock':
                    botResponse = "Entendido. Buscando un especialista en inventarios.";
                    break;
                case 'order':
                    botResponse = "Claro, transfiriendo tu caso a logística.";
                    break;
                case 'quote':
                     botResponse = "Excelente. Te pasaré con un ejecutivo de ventas.";
                    break;
                default:
                    botResponse = "Entendido, te contacto con un humano de inmediato.";
            }

            const botMsg = { 
                id: Date.now() + 1, 
                text: botResponse, 
                sender: 'bot', 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            };
            
            setMessages(prev => [...prev, botMsg]);
            
            // Iniciar proceso de conexión
            connectToSmartAgent(`Hola ${option.text}, requiero apoyo.`);

        }, 1000);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // User Message (Show immediately)
        const userMsg = { id: Date.now(), text: inputValue, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        setMessages(prev => [...prev, userMsg]);
        
        const originalText = inputValue;
        setInputValue("");
        setShowOptions(false);
        setIsTyping(true);

        // WhatsApp Redirection Simulation
        setTimeout(() => {
            const botMsg = { 
                id: Date.now() + 1, 
                text: "Gracias por tu mensaje. Buscaremos al agente más adecuado para responderte...", 
                sender: 'bot', 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            };
            setMessages(prev => [...prev, botMsg]);
            
            connectToSmartAgent(`Hola, escribo desde el chat web: "${originalText}"`);
        }, 1000);
    };

    return (
        <div style={{position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'Segoe UI, sans-serif'}}>
            
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '450px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '20px',
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        background: isBusinessOpen ? '#6a1b3d' : '#334155',
                        transition: 'background 0.5s ease',
                        color: 'white',
                        padding: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{position: 'relative'}}>
                            <div style={{
                                width: '35px', 
                                height: '35px', 
                                borderRadius: '50%', 
                                background: 'white', 
                                color: isBusinessOpen ? '#6a1b3d' : '#334155', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 'bold'
                            }}>
                                SC
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', 
                                background: isBusinessOpen ? '#22c55e' : '#94a3b8', 
                                borderRadius: '50%', 
                                border: `2px solid ${isBusinessOpen ? '#6a1b3d' : '#334155'}`
                            }}></div>
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{fontWeight: 'bold', fontSize: '15px'}}>
                                {isBusinessOpen ? 'Soporte WhatsApp' : 'Fuera de Horario'}
                            </div>
                            <div style={{fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px'}}>
                                {!isBusinessOpen && <Clock size={10} />}
                                {isBusinessOpen ? 'Tiempo de respuesta: ~2 min' : 'L-V 8am-7pm | Sab 9am-2pm'}
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div style={{
                        flex: 1,
                        background: '#f8fafc',
                        padding: '15px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%'
                            }}>
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: msg.sender === 'user' ? '#6a1b3d' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#333',
                                    boxShadow: msg.sender !== 'user' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                    border: msg.sender !== 'user' ? '1px solid #e2e8f0' : 'none',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                    borderTopLeftRadius: msg.sender === 'bot' ? '2px' : '12px'
                                }}>
                                    {msg.isAction ? (
                                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                                            <span>Hemos preparado el chat para ti:</span>
                                            <a href={msg.url} target="_blank" rel="noopener noreferrer" style={{
                                                display: 'block', 
                                                background: '#25D366', 
                                                color: 'white', 
                                                textDecoration: 'none', 
                                                padding: '8px 15px', 
                                                borderRadius: '20px', 
                                                textAlign: 'center', 
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                marginTop: '5px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                Continuar en WhatsApp 🔗
                                            </a>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                <div style={{
                                    fontSize: '10px', 
                                    color: '#94a3b8', 
                                    marginTop: '4px', 
                                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                                }}>
                                    {msg.time}
                                </div>
                            </div>
                        ))}
                        
                        {/* Quick Action Chips */}
                        {showOptions && !isTyping && (
                            <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'5px'}}>
                                {quickActions.map(action => (
                                    <button 
                                        key={action.id}
                                        onClick={() => handleOptionClick(action)}
                                        style={{
                                            background: 'white',
                                            border: '1px solid #6a1b3d',
                                            color: '#6a1b3d',
                                            padding: '8px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#6a1b3d'; e.currentTarget.style.color = 'white'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#6a1b3d'; }}
                                    >
                                        {action.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isTyping && (
                            <div style={{alignSelf: 'flex-start', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #eee'}}>
                                <div className="typing-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '15px',
                        background: 'white',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                    }}>
                        <button type="button" style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer'}}><Paperclip size={18}/></button>
                        <input 
                            placeholder="Escribe tu mensaje..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: '#f1f5f9',
                                padding: '10px 15px',
                                borderRadius: '20px',
                                outline: 'none',
                                fontSize: '14px'
                            }}
                        />
                         <button type="submit" disabled={!inputValue.trim()} style={{
                             background: inputValue.trim() ? '#6a1b3d' : '#e2e8f0', 
                             color: 'white', 
                             border: 'none', 
                             width: '35px', 
                             height: '35px', 
                             borderRadius: '50%', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center',
                             cursor: inputValue.trim() ? 'pointer' : 'default',
                             transition: 'background 0.2s'
                         }}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#6a1b3d',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(106, 27, 61, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .typing-dots span {
                    animation: blink 1.4s infinite both;
                    font-size: 20px;
                    line-height: 10px;
                    margin: 0 1px;
                }
                .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink {
                    0% { opacity: 0.2; }
                    20% { opacity: 1; }
                    100% { opacity: 0.2; }
                }
            `}</style>
        </div>
    );
}
