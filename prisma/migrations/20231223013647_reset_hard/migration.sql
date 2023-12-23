/*
  Warnings:

  - You are about to drop the column `alreadyActionouverite` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `alreadyActionouverite`,
    ADD COLUMN `already` JSON NULL;
