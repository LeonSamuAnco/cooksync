import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import './NotificationsPanel.css';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    connected,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  // Filtrar notificaciones según el filtro seleccionado
  useEffect(() => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = notifications.filter((n) => !n.leido);
    } else if (filter === 'read') {
      filtered = notifications.filter((n) => n.leido);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  // Manejar click en notificación
  const handleNotificationClick = async (notification) => {
    if (!notification.leido) {
      await markAsRead(notification.id);
    }

    // Navegar a la URL de referencia si existe
    if (notification.referenciaUrl) {
      window.location.href = notification.referenciaUrl;
    }
  };

  // Manejar eliminación
  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    await removeNotification(notificationId);
  };

  // Manejar marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="notifications-overlay" onClick={onClose}></div>

      {/* Panel */}
      <div className="notifications-panel">
        {/* Header */}
        <div className="notifications-header">
          <div className="header-title">
            <h3>🔔 Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Connection Status */}
        <div className="connection-status">
          {connected ? (
            <span className="status-connected">● Conectado</span>
          ) : (
            <span className="status-disconnected">● Desconectado</span>
          )}
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídas ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídas ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="notifications-actions">
            <button
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              ✓ Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">
              <div className="spinner"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔕</div>
              <p>
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : filter === 'read'
                  ? 'No tienes notificaciones leídas'
                  : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={(e) => handleDelete(notification.id, e)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
