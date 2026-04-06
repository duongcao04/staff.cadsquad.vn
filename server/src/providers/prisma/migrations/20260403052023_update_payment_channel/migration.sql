-- CreateEnum
CREATE TYPE "PaymentChannelType" AS ENUM ('BANK', 'E_WALLET', 'CRYPTO');

-- AlterTable
ALTER TABLE "PaymentChannel" ADD COLUMN     "accountDetails" TEXT,
ADD COLUMN     "feeRate" DOUBLE PRECISION,
ADD COLUMN     "fixedFee" DOUBLE PRECISION,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "totalFees" DOUBLE PRECISION,
ADD COLUMN     "totalVolume" DOUBLE PRECISION,
ADD COLUMN     "type" "PaymentChannelType" NOT NULL DEFAULT 'BANK';
