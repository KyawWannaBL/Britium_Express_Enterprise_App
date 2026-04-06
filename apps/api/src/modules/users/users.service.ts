import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { employee: true, roleBindings: { include: { role: true, branch: true } } } }); }
  findById(id: string) { return this.prisma.user.findUnique({ where: { id }, include: { employee: true, roleBindings: { include: { role: true, branch: true } } } }); }
}
