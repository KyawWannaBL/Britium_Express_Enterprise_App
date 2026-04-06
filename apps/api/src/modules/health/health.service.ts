import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/integrations/redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async live() {
    return {
      status: "ok",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    const redis = await this.redisService.getClient();
    await redis.ping();

    return {
      status: "ready",
      database: "ok",
      redis: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
