import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, OnGatewayConnection,
  OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) { socket.disconnect(); return; }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      socket.data.userId = payload.sub;

      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(socket.id);

      this.logger.log(`User ${payload.sub} connected: ${socket.id}`);
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join-project')
  handleJoinProject(
    @ConnectedSocket() socket: Socket,
    @MessageBody() projectId: string,
  ) {
    socket.join(`project:${projectId}`);
    socket.to(`project:${projectId}`).emit('user-online', {
      userId: socket.data.userId,
    });
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(
    @ConnectedSocket() socket: Socket,
    @MessageBody() projectId: string,
  ) {
    socket.leave(`project:${projectId}`);
    socket.to(`project:${projectId}`).emit('user-offline', {
      userId: socket.data.userId,
    });
  }

  @SubscribeMessage('task-editing')
  handleTaskEditing(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { projectId: string; taskId: string; editing: boolean },
  ) {
    socket.to(`project:${data.projectId}`).emit('task-editing', {
      userId: socket.data.userId,
      taskId: data.taskId,
      editing: data.editing,
    });
  }

  emitToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }
}