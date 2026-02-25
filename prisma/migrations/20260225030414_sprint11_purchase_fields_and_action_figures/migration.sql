-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('NEW_SEALED', 'NEW_OPENED', 'USED');

-- CreateEnum
CREATE TYPE "CurrentStatus" AS ENUM ('SEALED', 'AS_NEW', 'NORMAL_USE', 'WEARED_DOWN', 'DAMAGED', 'BROKEN');

-- AlterEnum
ALTER TYPE "CollectionType" ADD VALUE 'ACTIONFIGURE';

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "currentStatus" "CurrentStatus",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "purchasePlace" TEXT,
ADD COLUMN     "purchaseStatus" "PurchaseStatus";

-- CreateTable
CREATE TABLE "ActionFigure" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "series" TEXT,
    "characterName" TEXT,
    "scale" TEXT,
    "material" TEXT,
    "height" TEXT,
    "articulation" TEXT,
    "accessories" TEXT NOT NULL DEFAULT '[]',
    "edition" TEXT,
    "seriesNumber" TEXT,

    CONSTRAINT "ActionFigure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionFigure_itemId_key" ON "ActionFigure"("itemId");

-- CreateIndex
CREATE INDEX "ActionFigure_manufacturer_idx" ON "ActionFigure"("manufacturer");

-- CreateIndex
CREATE INDEX "ActionFigure_series_idx" ON "ActionFigure"("series");

-- CreateIndex
CREATE INDEX "ActionFigure_characterName_idx" ON "ActionFigure"("characterName");

-- AddForeignKey
ALTER TABLE "ActionFigure" ADD CONSTRAINT "ActionFigure_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
