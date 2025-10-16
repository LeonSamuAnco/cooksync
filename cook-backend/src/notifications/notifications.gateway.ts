import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Manejar conexión de cliente
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Cliente ${client.id} sin token, desconectando...`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.userId;

      // Guardar conexión
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`Usuario ${userId} conectado (socket: ${client.id})`);

      // Enviar notificaciones no leídas al conectarse
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });

    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Manejar desconexión de cliente
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Usuario ${userId} desconectado (socket: ${client.id})`);
    }
  }

  /**
   * Enviar notificación a un usuario específico
   */
  sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('new-notification', notification);
      this.logger.log(`Notificación enviada a usuario ${userId}`);
    } else {
      this.logger.warn(`Usuario ${userId} no está conectado`);
    }
  }

  /**
   * Enviar contador de no leídas a un usuario
   */
  async sendUnreadCountToUser(userId: number) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      const count = await this.notificationsService.getUnreadCount(userId);
      this.server.to(socketId).emit('unread-count', { count });
    }
  }

  /**
   * Broadcast a todos los usuarios conectados
   */
  broadcastNotification(notification: any) {
    this.server.emit('broadcast-notification', notification);
    this.logger.log('Notificación broadcast enviada a todos los usuarios');
  }

  /**
   * Escuchar solicitud de notificaciones
   */
  @SubscribeMessage('get-notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const userId = client.data.userId;
    
    if (!userId) {
      return { error: 'No autenticado' };
    }

    const notifications = await this.notificationsService.findAllByUser(
      userId,
      { page: data.page || 1, limit: data.limit || 20 },
    );

    return notifications;
  }

  /**
   * Marcar notificación como leída
   */
  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: number },
  ) {
    const userId = client.data.userId;
    
    if (!userId) {
      return { error: 'No autenticado' };
    }

    try {
      await this.notificationsService.markAsRead(data.notificationId, userId);
      
      // Actualizar contador
      await this.sendUnreadCountToUser(userId);
      
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Marcar todas como leídas
   */
  @SubscribeMessage('mark-all-as-read')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    
    if (!userId) {
      return { error: 'No autenticado' };
    }

    try {
      const result = await this.notificationsService.markAllAsRead(userId);
      
      // Actualizar contador
      await this.sendUnreadCountToUser(userId);
      
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}
