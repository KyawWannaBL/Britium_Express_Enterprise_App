import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import { okResponse } from "src/common/dto/api-response.dto";
import { AuthService } from "./auth.service";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) { return okResponse(this.authService.buildSessionPayload(user), "Authenticated user loaded"); }
}
