/*
  Warnings:

  - Added the required column `admin` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Room` ADD COLUMN `admin` VARCHAR(191) NOT NULL;
