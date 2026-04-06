import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BRANCH_SCOPED_KEY } from "../decorators/branch-scoped.decorator";
import { AuthUser } from "../types/auth-user.type";

@Injectable()
export class BranchScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const branchScoped = this.reflector.getAllAndOverride<boolean>(BRANCH_SCOPED_KEY, [context.getHandler(), context.getClass()]);
    if (!branchScoped) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    const branchId = request.params?.branchId ?? request.body?.branchId ?? request.query?.branchId;
    if (!user?.branchId || !branchId) return true;
    if (String(user.branchId) !== String(branchId)) throw new ForbiddenException("Cross-branch access is not allowed");
    return true;
  }
}
