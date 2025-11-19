import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import notificationsService from '../services/notificationsService';

/**
 * Hook personalizado para gestionar notificaciones en tiempo real
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  
  const socketRef = useRef(null);

  /**
   * Conectar a WebSocket
   */
  const connect = useCallback(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No hay token, no se puede conectar a WebSocket');
      return;
    }

    // Crear conexión
    socketRef.current = io('http://localhost:3002/notifications', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    // Eventos de conexión
    socketRef.current.on('connect', () => {
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Desconectado de WebSocket');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
      setConnected(false);
    });

    // Eventos de notificaciones
    socketRef.current.on('new-notification', (notification) => {
      
      // Agregar al inicio de la lista
      setNotifications((prev) => [notification, ...prev]);
      
      // Incrementar contador
      setUnreadCount((prev) => prev + 1);
      
      // Mostrar notificación del navegador si está permitido
      if (Notification.permission === 'granted') {
        new Notification(notification.titulo, {
          body: notification.mensaje,
          icon: notification.icono || '🔔',
        });
      }
    });

    socketRef.current.on('unread-count', (data) => {
      setUnreadCount(data.count);
    });

    socketRef.current.on('broadcast-notification', (notification) => {
      // Manejar notificaciones broadcast (promociones, anuncios, etc.)
    });

  }, []);

  /**
   * Desconectar de WebSocket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  /**
   * Cargar notificaciones desde la API
   */
  const loadNotifications = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await notificationsService.getMyNotifications(filters);
      setNotifications(data.notifications || []);
      return data;
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      return { notifications: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar contador de no leídas
   */
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error('Error cargando contador:', error);
      return 0;
    }
  }, []);

  /**
   * Marcar notificación como leída
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, leido: true } : n
        )
      );
      
      // Decrementar contador
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      // Emitir evento por WebSocket
      if (socketRef.current?.connected) {
        socketRef.current.emit('mark-as-read', { notificationId });
      }
      
      return true;
    } catch (error) {
      console.error('Error marcando como leída:', error);
      return false;
    }
  }, []);

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationsService.markAllAsRead();
      
      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, leido: true }))
      );
      
      // Resetear contador
      setUnreadCount(0);
      
      // Emitir evento por WebSocket
      if (socketRef.current?.connected) {
        socketRef.current.emit('mark-all-as-read');
      }
      
      return result;
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      return null;
    }
  }, []);

  /**
   * Eliminar notificación
   */
  const removeNotification = useCallback(async (notificationId) => {
    try {
      await notificationsService.remove(notificationId);
      
      // Remover del estado local
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      return true;
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      return false;
    }
  }, []);

  /**
   * Solicitar permiso para notificaciones del navegador
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  /**
   * Conectar automáticamente al montar
   */
  useEffect(() => {
    connect();
    loadNotifications();
    loadUnreadCount();
    requestNotificationPermission();

    // Desconectar al desmontar
    return () => {
      disconnect();
    };
  }, [connect, disconnect, loadNotifications, loadUnreadCount, requestNotificationPermission]);

  return {
    notifications,
    unreadCount,
    loading,
    connected,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    connect,
    disconnect,
  };
};

export default useNotifications;
