import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SessionExpiredModal.css';

const SessionExpiredModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="session-expired-overlay">
      <div className="session-expired-modal">
        <div className="session-expired-icon">⏰</div>
        <h2 className="session-expired-title">Sesión Expirada</h2>
        <p className="session-expired-message">
          Tu sesión ha caducado por seguridad. Por favor, inicia sesión nuevamente para continuar.
        </p>
        <div className="session-expired-actions">
          <button className="session-expired-btn-primary" onClick={handleLogin}>
            Iniciar Sesión
          </button>
          <button className="session-expired-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
