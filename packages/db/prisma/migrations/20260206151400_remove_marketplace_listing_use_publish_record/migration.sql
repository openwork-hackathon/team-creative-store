-- DropForeignKey
ALTER TABLE "MarketplaceListing" DROP CONSTRAINT IF EXISTS "MarketplaceListing_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplacePurchase" DROP CONSTRAINT IF EXISTS "MarketplacePurchase_listingId_fkey";

-- DropForeignKey
ALTER TABLE "MarketplacePurchase" DROP CONSTRAINT IF EXISTS "MarketplacePurchase_buyerId_fkey";

-- DropTable
DROP TABLE IF EXISTS "MarketplacePurchase";

-- DropTable
DROP TABLE IF EXISTS "MarketplaceListing";

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "publishRecordId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "priceAicc" DECIMAL(18,2) NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_publishRecordId_fkey" FOREIGN KEY ("publishRecordId") REFERENCES "PublishRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
