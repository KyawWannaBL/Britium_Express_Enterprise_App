import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/integrations/redis/redis.service";

@Injectable()
export class NotificationsEventsService {
  constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService) {}
  async notifyUser(params: { userId: string; portal: string; title: string; body: string; priority?: string; event?: string; data?: unknown; }) {
    const notification = await this.prisma.notification.create({
      data: { userId: params.userId, portal: params.portal, title: params.title, body: params.body, priority: params.priority ?? "normal" },
    });
    await this.redisService.publish("notifications", {
      userId: params.userId,
      event: params.event ?? "notification:new",
      data: { notification, payload: params.data ?? null },
    });
    return notification;
  }
}
