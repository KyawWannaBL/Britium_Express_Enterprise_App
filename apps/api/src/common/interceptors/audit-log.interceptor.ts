import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthUser } from "src/common/types/auth-user.type";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    const method = request.method;
    const path = request.originalUrl;
    return next.handle().pipe(
      tap(async () => {
        await this.prisma.auditLog.create({
          data: {
            userId: user?.sub ?? null,
            portal: (request.headers["x-portal"] as string | undefined) ?? "unknown",
            action: `${method} ${path}`,
            refType: request.body?.refType ?? null,
            refId: request.body?.refId ?? null,
            afterJson: { query: request.query, params: request.params, bodyKeys: Object.keys(request.body ?? {}) },
            device: (request.headers["x-device-id"] as string | undefined) ?? null,
            ipAddress: request.ip ?? null,
          },
        });
      }),
    );
  }
}
