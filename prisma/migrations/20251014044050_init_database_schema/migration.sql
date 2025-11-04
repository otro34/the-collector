-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('VIDEOGAME', 'MUSIC', 'BOOK');

-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('MANGA', 'COMIC', 'GRAPHIC_NOVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "collectionType" "CollectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "coverUrl" TEXT,
    "price" DOUBLE PRECISION,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Videogame" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "publisher" TEXT,
    "developer" TEXT,
    "region" TEXT,
    "edition" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "metacriticScore" INTEGER,

    CONSTRAINT "Videogame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Music" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "publisher" TEXT,
    "format" TEXT NOT NULL,
    "discCount" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "tracklist" TEXT,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "BookType" NOT NULL,
    "author" TEXT NOT NULL,
    "volume" TEXT,
    "series" TEXT,
    "publisher" TEXT,
    "coverType" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "githubUsername" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingPath" (
    "id" TEXT NOT NULL,
    "bookType" "BookType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingPhase" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingRecommendation" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "series" TEXT,
    "author" TEXT,
    "volumes" TEXT,
    "issues" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT,
    "reasoning" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_collectionType_idx" ON "Item"("collectionType");

-- CreateIndex
CREATE INDEX "Item_title_idx" ON "Item"("title");

-- CreateIndex
CREATE INDEX "Item_year_idx" ON "Item"("year");

-- CreateIndex
CREATE INDEX "Item_createdAt_idx" ON "Item"("createdAt");

-- CreateIndex
CREATE INDEX "Item_collectionType_year_idx" ON "Item"("collectionType", "year");

-- CreateIndex
CREATE INDEX "Item_collectionType_createdAt_idx" ON "Item"("collectionType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Videogame_itemId_key" ON "Videogame"("itemId");

-- CreateIndex
CREATE INDEX "Videogame_platform_idx" ON "Videogame"("platform");

-- CreateIndex
CREATE INDEX "Videogame_publisher_idx" ON "Videogame"("publisher");

-- CreateIndex
CREATE INDEX "Videogame_developer_idx" ON "Videogame"("developer");

-- CreateIndex
CREATE UNIQUE INDEX "Music_itemId_key" ON "Music"("itemId");

-- CreateIndex
CREATE INDEX "Music_artist_idx" ON "Music"("artist");

-- CreateIndex
CREATE INDEX "Music_format_idx" ON "Music"("format");

-- CreateIndex
CREATE INDEX "Music_publisher_idx" ON "Music"("publisher");

-- CreateIndex
CREATE UNIQUE INDEX "Book_itemId_key" ON "Book"("itemId");

-- CreateIndex
CREATE INDEX "Book_type_idx" ON "Book"("type");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "Book_series_idx" ON "Book"("series");

-- CreateIndex
CREATE INDEX "Book_publisher_idx" ON "Book"("publisher");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_githubUsername_idx" ON "User"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingPath_bookType_name_key" ON "ReadingPath"("bookType", "name");

-- CreateIndex
CREATE INDEX "ReadingPath_bookType_idx" ON "ReadingPath"("bookType");

-- CreateIndex
CREATE INDEX "ReadingPhase_pathId_idx" ON "ReadingPhase"("pathId");

-- CreateIndex
CREATE INDEX "ReadingPhase_pathId_order_idx" ON "ReadingPhase"("pathId", "order");

-- CreateIndex
CREATE INDEX "ReadingRecommendation_phaseId_idx" ON "ReadingRecommendation"("phaseId");

-- CreateIndex
CREATE INDEX "ReadingRecommendation_series_idx" ON "ReadingRecommendation"("series");

-- CreateIndex
CREATE INDEX "ReadingRecommendation_phaseId_priority_idx" ON "ReadingRecommendation"("phaseId", "priority");

-- AddForeignKey
ALTER TABLE "Videogame" ADD CONSTRAINT "Videogame_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingPhase" ADD CONSTRAINT "ReadingPhase_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "ReadingPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingRecommendation" ADD CONSTRAINT "ReadingRecommendation_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ReadingPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
