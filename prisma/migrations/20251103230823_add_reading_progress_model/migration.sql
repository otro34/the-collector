-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "readingPath" TEXT,
    "currentPhase" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_itemId_key" ON "ReadingProgress"("itemId");

-- CreateIndex
CREATE INDEX "ReadingProgress_itemId_idx" ON "ReadingProgress"("itemId");

-- CreateIndex
CREATE INDEX "ReadingProgress_isRead_idx" ON "ReadingProgress"("isRead");

-- CreateIndex
CREATE INDEX "ReadingProgress_itemId_isRead_idx" ON "ReadingProgress"("itemId", "isRead");

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
