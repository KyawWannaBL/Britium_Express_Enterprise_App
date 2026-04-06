import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import { okResponse } from "src/common/dto/api-response.dto";
import { TasksService } from "./tasks.service";
@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  @Get("me")
  async mine(@CurrentUser() user: AuthUser) { const t = await this.tasksService.findMine(user.sub); return okResponse(t, "Tasks loaded", { total: t.length }); }
  @Patch(":id/status/:status")
  async updateStatus(@Param("id") id: string, @Param("status") status: string) {
    const t = await this.tasksService.updateStatus(id, status); return okResponse(t, "Task updated");
  }
}
