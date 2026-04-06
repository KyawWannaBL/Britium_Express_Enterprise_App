import { Injectable } from "@nestjs/common";
import { AuthUser } from "src/common/types/auth-user.type";
@Injectable()
export class AuthService {
  buildSessionPayload(user: AuthUser) {
    return { id: user.sub, email: user.email ?? null, name: user.name ?? null, roles: user.roles, employeeId: user.employeeId ?? null, branchId: user.branchId ?? null, zoneCode: user.zoneCode ?? null, portalAccess: user.portalAccess ?? [], deviceId: user.deviceId ?? null };
  }
}
