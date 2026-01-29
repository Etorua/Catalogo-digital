import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash, Save, Edit, Search, MessageSquare, Tag, CheckCircle, XCircle, Bot } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ChatbotManager() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRule, setEditingRule] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { register, handleSubmit, reset, setValue } = useForm();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await axios.get('/api/chatbot/knowledge');
            setRules(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingRule) {
                await axios.put(`/api/chatbot/knowledge/${editingRule.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/chatbot/knowledge', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchRules();
            handleCancelEdit();
        } catch (error) {
            console.error(error);
            alert("Error al guardar la regla");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta pregunta?")) return;
        try {
            await axios.delete(`/api/chatbot/knowledge/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRules();
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (rule) => {
        setEditingRule(rule);
        setValue('keywords', rule.keywords);
        setValue('answer', rule.answer);
        setValue('active', rule.active);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingRule(null);
        reset();
    };

    // Filter rules
    const filteredRules = rules.filter(r => 
        r.keywords.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b px-8 py-6 mb-8">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Bot className="h-8 w-8 text-[#f96302]" />
                            Entrenamiento de IA
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Configura las respuestas automáticas para las preguntas frecuentes de tus clientes.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-100">
                            <strong>{rules.length}</strong> Conocimientos Activos
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Lateral Panel: Editor Form */}
                <div className="lg:col-span-4 animate-in slide-in-from-left duration-500">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-6">
                        <div className="bg-gray-900 px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                {editingRule ? <Edit size={18} /> : <Plus size={18} />}
                                {editingRule ? 'Editar Conocimiento' : 'Agregar Nuevo'}
                            </h3>
                            {editingRule && (
                                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white text-xs underline">
                                    Cancelar
                                </button>
                            )}
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Tag size={16} /> Palabras Clave
                                    </label>
                                    <input 
                                        {...register('keywords', { required: true })}
                                        className="w-full border-gray-300 border bg-gray-50 p-3 rounded-lg focus:ring-2 focus:ring-[#f96302] focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm"
                                        placeholder="Ej: horario, ubicación, teléfono..."
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5 ml-1">
                                        Separa las variantes con comas para mejor detección.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MessageSquare size={16} /> Respuesta del Asistente
                                    </label>
                                    <textarea 
                                        {...register('answer', { required: true })}
                                        className="w-full border-gray-300 border bg-gray-50 p-3 rounded-lg h-40 focus:ring-2 focus:ring-[#f96302] focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
                                        placeholder="Escribe la respuesta amigable que dará el bot..."
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <label className="text-sm font-medium text-gray-700 cursor-pointer" htmlFor="activeCheck">
                                        ¿Respuesta Activa?
                                    </label>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" id="activeCheck" {...register('active')} defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#f96302]" style={{right: 'unset'}}/>
                                        <label htmlFor="activeCheck" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </div>
                                
                                <button type="submit" className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition shadow-lg shadow-gray-300/50 flex justify-center items-center gap-2 active:scale-95 transform duration-150">
                                    <Save size={20} />
                                    {editingRule ? 'Guardar Cambios' : 'Registrar Conocimiento'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Main Panel: List */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
                        <Search className="text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar en la base de conocimientos..." 
                            className="flex-1 outline-none text-gray-700"
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>

                    <div className="grid gap-4 animate-in slide-in-from-bottom duration-500">
                        {loading ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <span className="loading-spinner"></span>
                                <p className="text-gray-400 mt-4">Cargando base de datos...</p>
                            </div>
                        ) : filteredRules.length > 0 ? (
                            filteredRules.map(rule => (
                                <div key={rule.id} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-gray-200 relative overflow-hidden">
                                    {/* Status Indicator Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${rule.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>

                                    <div className="flex justify-between items-start pl-3">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {rule.keywords.split(',').map((k, i) => (
                                                    <span key={i} className="bg-orange-50 text-[#f96302] text-xs px-2.5 py-1 rounded-full font-medium border border-orange-100">
                                                        {k.trim()}
                                                    </span>
                                                ))}
                                                {!rule.active && (
                                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded border flex items-center gap-1">
                                                        <XCircle size={12}/> Inactivo
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-3 items-start">
                                                <div className="mt-1 min-w-[24px]">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                        <Bot size={16} className="text-gray-400" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 w-full">
                                                    {rule.answer}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <button 
                                                onClick={() => startEdit(rule)} 
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(rule.id)} 
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Eliminar"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bot className="text-gray-400 h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No hay conocimientos aún</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                    Agrega palabras clave y respuestas para que el asistente pueda ayudar a tus clientes automáticamente.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
