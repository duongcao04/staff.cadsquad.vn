-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('OWN', 'DEPARTMENT', 'ALL');

-- AlterTable
ALTER TABLE "UserPermission" ADD COLUMN "scope" "PermissionScope" NOT NULL DEFAULT 'ALL';
