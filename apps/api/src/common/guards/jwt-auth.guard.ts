import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { AuthUser } from "../types/auth-user.type";

type KeycloakPayload = JWTPayload & {
  email?: string; name?: string; employee_id?: string;
  branch_id?: string; zone_code?: string; device_id?: string;
  portal_access?: string[]; realm_access?: { roles?: string[] };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwks;
  constructor(private readonly configService: ConfigService) {
    const issuer = this.configService.getOrThrow<string>("KEYCLOAK_ISSUER");
    this.jwks = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    if (!authHeader?.startsWith("Bearer ")) throw new UnauthorizedException("Missing bearer token");
    const token = authHeader.slice(7).trim();
    const issuer = this.configService.getOrThrow<string>("KEYCLOAK_ISSUER");
    const audience = this.configService.getOrThrow<string>("KEYCLOAK_AUDIENCE");
    const { payload } = await jwtVerify(token, this.jwks, { issuer, audience });
    const claims = payload as KeycloakPayload;
    const user: AuthUser = {
      sub: String(claims.sub), email: claims.email, name: claims.name,
      roles: claims.realm_access?.roles ?? [], employeeId: claims.employee_id ?? null,
      branchId: claims.branch_id ?? null, zoneCode: claims.zone_code ?? null,
      portalAccess: claims.portal_access ?? [], deviceId: claims.device_id ?? null,
    };
    request.user = user;
    return true;
  }
}
