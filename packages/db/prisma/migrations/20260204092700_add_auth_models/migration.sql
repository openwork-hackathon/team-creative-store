-- CreateEnum
CREATE TYPE "CreativeStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "NftStatus" AS ENUM ('pending', 'confirmed', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "intentText" TEXT NOT NULL,
    "briefJson" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "draftJson" JSONB NOT NULL,
    "previewAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CreativeStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeVersion" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "baseCanvasKey" TEXT NOT NULL,
    "sourceTree" JSONB NOT NULL,
    "prompts" JSONB NOT NULL,
    "status" "VersionStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementSpec" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "safeArea" JSONB NOT NULL,
    "rules" JSONB NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "PlacementSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "placementSpecId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Render" (
    "id" TEXT NOT NULL,
    "renderJobId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Render_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishRecord" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftRecord" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "metadataUri" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "status" "NftStatus" NOT NULL DEFAULT 'pending',
    "mintedAt" TIMESTAMP(3),

    CONSTRAINT "NftRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementSpec_key_key" ON "PlacementSpec"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Render_renderJobId_key" ON "Render"("renderJobId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishRecord_slug_key" ON "PublishRecord"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NftRecord_versionId_key" ON "NftRecord"("versionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeVersion" ADD CONSTRAINT "CreativeVersion_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "CreativeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_placementSpecId_fkey" FOREIGN KEY ("placementSpecId") REFERENCES "PlacementSpec"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Render" ADD CONSTRAINT "Render_renderJobId_fkey" FOREIGN KEY ("renderJobId") REFERENCES "RenderJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishRecord" ADD CONSTRAINT "PublishRecord_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishRecord" ADD CONSTRAINT "PublishRecord_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "CreativeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftRecord" ADD CONSTRAINT "NftRecord_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "CreativeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
