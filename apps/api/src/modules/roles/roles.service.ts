import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.role.findMany({ orderBy: { code: "asc" }, include: { bindings: true } }); }
}
