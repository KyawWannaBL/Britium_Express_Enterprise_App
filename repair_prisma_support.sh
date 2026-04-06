#!/usr/bin/env bash
set -euo pipefail

mkdir -p "apps/api/src/prisma"
mkdir -p "apps/api/prisma"

cat > "apps/api/src/prisma/prisma.service.ts" <<'EOT'
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
EOT

cat > "apps/api/src/prisma/prisma.module.ts" <<'EOT'
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
EOT

echo "Prisma support files repaired."
echo "IMPORTANT: schema.prisma is still needed before running prisma generate/migrate."
