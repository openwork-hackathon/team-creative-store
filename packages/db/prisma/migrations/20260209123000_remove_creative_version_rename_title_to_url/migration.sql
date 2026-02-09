-- DropForeignKey
ALTER TABLE "CreativeVersion" DROP CONSTRAINT IF EXISTS "CreativeVersion_creativeId_fkey";

-- DropForeignKey
ALTER TABLE "RenderJob" DROP CONSTRAINT IF EXISTS "RenderJob_versionId_fkey";

-- DropForeignKey
ALTER TABLE "PublishRecord" DROP CONSTRAINT IF EXISTS "PublishRecord_versionId_fkey";

-- Rename Creative.title to Creative.url
ALTER TABLE "Creative" RENAME COLUMN "title" TO "url";

-- Add updatedAt column to Creative
ALTER TABLE "Creative" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Modify RenderJob: rename versionId to creativeId
ALTER TABLE "RenderJob" DROP COLUMN IF EXISTS "versionId";
ALTER TABLE "RenderJob" ADD COLUMN IF NOT EXISTS "creativeId" TEXT;

-- Modify PublishRecord: remove versionId
ALTER TABLE "PublishRecord" DROP COLUMN IF EXISTS "versionId";

-- Drop NftRecord table
DROP TABLE IF EXISTS "NftRecord";

-- Drop CreativeVersion table
DROP TABLE IF EXISTS "CreativeVersion";

-- Add foreign key constraints
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative"("id") ON DELETE SET NULL ON UPDATE CASCADE;
