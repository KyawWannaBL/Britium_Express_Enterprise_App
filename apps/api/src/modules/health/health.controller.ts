import { Controller, Get } from "@nestjs/common";
import { okResponse } from "src/common/dto/api-response.dto";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("live")
  async live() {
    return okResponse(await this.healthService.live(), "Liveness OK");
  }

  @Get("ready")
  async ready() {
    return okResponse(await this.healthService.ready(), "Readiness OK");
  }
}
