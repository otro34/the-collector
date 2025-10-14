-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "language" TEXT,
    "country" TEXT,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "coverUrl" TEXT,
    "price" REAL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "customFields" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Videogame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "publisher" TEXT,
    "developer" TEXT,
    "region" TEXT,
    "edition" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "metacriticScore" INTEGER,
    CONSTRAINT "Videogame_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Music" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "publisher" TEXT,
    "format" TEXT NOT NULL,
    "discCount" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "tracklist" TEXT,
    CONSTRAINT "Music_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "volume" TEXT,
    "series" TEXT,
    "publisher" TEXT,
    "coverType" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Book_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Item_collectionType_idx" ON "Item"("collectionType");

-- CreateIndex
CREATE INDEX "Item_title_idx" ON "Item"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Videogame_itemId_key" ON "Videogame"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Music_itemId_key" ON "Music"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_itemId_key" ON "Book"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
