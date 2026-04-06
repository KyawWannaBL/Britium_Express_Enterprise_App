#!/usr/bin/env bash
set -Eeuo pipefail

trap 'echo ""; echo "FAILED at line $LINENO"; exit 1' ERR

FRONTEND_DIR="apps/admin-web"
if [ -d apps/admin-web ]; then
  FRONTEND_DIR="apps/admin-web"
fi

mkdir -p apps/api/src/integrations/s3
mkdir -p apps/api/src/modules/uploads
mkdir -p apps/api/src/modules/supervisor
mkdir -p apps/api/src/modules/manifests
mkdir -p apps/api/src/modules/transfers
mkdir -p apps/api/src/modules/qr
mkdir -p apps/api/src/modules/labels
mkdir -p apps/api/src/modules/tamper-tags
mkdir -p apps/api/src/modules/devices
mkdir -p apps/api/src/common/middleware
mkdir -p apps/api/src/modules/health
mkdir -p apps/api/src/queues/workers
mkdir -p apps/api/src/modules/deliveries/dto
mkdir -p apps/api/src/modules/uploads/dto
mkdir -p .github/workflows
mkdir -p "$FRONTEND_DIR/src/hooks"
mkdir -p infra

echo "Folder scaffold created successfully"
