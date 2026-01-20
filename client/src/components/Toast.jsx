import { useEffect } from 'react';

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: '#15803d', // Green
    info: '#0284c7', // Blue
    warning: '#f96302', // Orange
    error: '#dc2626' // Red
  };

  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <div className="toast-notification" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'white',
        borderLeft: `6px solid ${bgColors[type]}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out',
        color: '#333'
    }}>
      <div style={{fontSize: '20px'}}>{icons[type]}</div>
      <div>
        <h4 style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: bgColors[type]}}>
            {type === 'success' ? 'Éxito' : type === 'warning' ? 'Aviso' : type === 'error' ? 'Error' : 'Información'}
        </h4>
        <p style={{margin: 0, fontSize: '14px', color: '#555'}}>{message}</p>
      </div>
      <button onClick={onClose} style={{
          marginLeft: 'auto', 
          background: 'none', 
          border: 'none', 
          fontSize: '18px', 
          cursor: 'pointer',
          color: '#999'
      }}>×</button>
    </div>
  );
}

export default Toast;
