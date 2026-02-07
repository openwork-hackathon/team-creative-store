-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('active', 'sold', 'delisted');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('ad_kit', 'branding', 'character', 'ui_kit', 'background', 'template', 'logo', 'scene_3d');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('standard', 'extended', 'exclusive');

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "priceAicc" DECIMAL(18,2) NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "licenseType" "LicenseType" NOT NULL DEFAULT 'standard',
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplacePurchase" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "priceAicc" DECIMAL(18,2) NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplacePurchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplacePurchase" ADD CONSTRAINT "MarketplacePurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplacePurchase" ADD CONSTRAINT "MarketplacePurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
