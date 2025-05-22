/*
  Warnings:

  - You are about to drop the `_QuotaTorole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_QuotaTorole" DROP CONSTRAINT "_QuotaTorole_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuotaTorole" DROP CONSTRAINT "_QuotaTorole_B_fkey";

-- DropIndex
DROP INDEX "Quota_id_key";

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "googleDocUrl" TEXT;

-- AlterTable
ALTER TABLE "inactivityNotice" ADD COLUMN     "revoked" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "registered" BOOLEAN;

-- DropTable
DROP TABLE "_QuotaTorole";

-- CreateTable
CREATE TABLE "QuotaRole" (
    "quotaId" UUID NOT NULL,
    "roleId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "QuotaRole_quotaId_roleId_key" ON "QuotaRole"("quotaId", "roleId");

-- AddForeignKey
ALTER TABLE "QuotaRole" ADD CONSTRAINT "QuotaRole_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "Quota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotaRole" ADD CONSTRAINT "QuotaRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
