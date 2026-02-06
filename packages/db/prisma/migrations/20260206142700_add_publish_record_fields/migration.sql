-- CreateEnum
CREATE TYPE "PublishCategory" AS ENUM ('ads', 'branding', 'e_commerce', 'gaming');

-- AlterTable
ALTER TABLE "PublishRecord" ADD COLUMN     "category" "PublishCategory" NOT NULL DEFAULT 'ads',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "includeSourceFiles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseType" "LicenseType" NOT NULL DEFAULT 'standard',
ADD COLUMN     "priceAicc" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL;
