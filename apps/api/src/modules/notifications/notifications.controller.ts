import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { okResponse } from "src/common/dto/api-response.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import { NotificationsService } from "./notifications.service";
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get("me")
  async mine(@CurrentUser() user: AuthUser) { const notifications = await this.notificationsService.findForUser(user.sub); return okResponse(notifications, "Notifications loaded", { total: notifications.length }); }
  @Patch(":id/read")
  async markAsRead(@Param("id") id: string) { const notification = await this.notificationsService.markAsRead(id); return okResponse(notification, "Notification marked as read"); }
}
