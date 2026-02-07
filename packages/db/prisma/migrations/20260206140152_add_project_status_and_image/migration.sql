/*
  Warnings:

  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('draft', 'generating', 'ready', 'published');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('active', 'sold', 'delisted');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('ad_kit', 'branding', 'character', 'ui_kit', 'background', 'template', 'logo', 'scene_3d');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('standard', 'extended', 'exclusive');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;