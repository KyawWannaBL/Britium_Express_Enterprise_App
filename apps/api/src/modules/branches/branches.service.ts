import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.branch.findMany({ orderBy: { code: "asc" }, include: { warehouseLocations: true } }); }
  findById(id: string) { return this.prisma.branch.findUnique({ where: { id }, include: { employees: true, warehouseLocations: true } }); }
}
