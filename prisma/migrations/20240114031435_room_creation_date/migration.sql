/*
  Warnings:

  - Added the required column `creationDate` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Room` ADD COLUMN `creationDate` DATE NOT NULL;
