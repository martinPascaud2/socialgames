/*
  Warnings:

  - You are about to drop the column `already` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `already`,
    ADD COLUMN `alreadyActionouverite` JSON NULL;
