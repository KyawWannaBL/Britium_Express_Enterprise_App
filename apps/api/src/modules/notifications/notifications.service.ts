import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
  findForUser(userId: string) { return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }); }
  markAsRead(id: string) { return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } }); }
}
