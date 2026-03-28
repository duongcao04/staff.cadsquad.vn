-- CreateEnum
CREATE TYPE "SystemModule" AS ENUM ('JOB', 'DELIVERY', 'FINANCIAL', 'SYSTEM', 'SECURITY', 'USER_MANAGEMENT', 'CLIENT', 'ASSET');

-- CreateTable
CREATE TABLE "SystemAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "module" "SystemModule" NOT NULL,
    "targetId" TEXT,
    "targetDisplay" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemAuditLog_actorId_idx" ON "SystemAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "SystemAuditLog_module_idx" ON "SystemAuditLog"("module");

-- CreateIndex
CREATE INDEX "SystemAuditLog_targetId_idx" ON "SystemAuditLog"("targetId");

-- CreateIndex
CREATE INDEX "SystemAuditLog_createdAt_idx" ON "SystemAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "SystemAuditLog" ADD CONSTRAINT "SystemAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
