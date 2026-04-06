import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RedisService } from "src/integrations/redis/redis.service";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/notifications" })
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;
  constructor(private readonly redisService: RedisService) {}

  async afterInit() {
    const subscriber = await this.redisService.getSubscriber();
    await subscriber.subscribe("notifications", (message) => {
      const payload = JSON.parse(message);
      if (payload.userId) {
        this.server.to(`user:${payload.userId}`).emit(payload.event, payload.data);
      } else {
        this.server.emit(payload.event, payload.data);
      }
    });
  }
  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) client.join(`user:${userId}`);
  }
  @SubscribeMessage("join-user-room")
  joinUserRoom(@ConnectedSocket() client: Socket, @MessageBody() body: { userId: string }) {
    client.join(`user:${body.userId}`);
    return { ok: true };
  }
}
