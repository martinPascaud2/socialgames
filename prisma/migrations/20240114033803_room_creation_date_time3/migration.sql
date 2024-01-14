/*
  Warnings:

  - You are about to alter the column `creationDate` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `Time(0)` to `DateTime(0)`.

*/
-- AlterTable
ALTER TABLE `Room` MODIFY `creationDate` DATETIME(0) NOT NULL;
