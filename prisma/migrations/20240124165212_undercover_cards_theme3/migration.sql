/*
  Warnings:

  - You are about to drop the `Undercovercard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Undercovercard` DROP FOREIGN KEY `Undercovercard_themeId_fkey`;

-- DropTable
DROP TABLE `Undercovercard`;

-- CreateTable
CREATE TABLE `Undercoverword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,
    `themeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Undercoverword` ADD CONSTRAINT `Undercoverword_themeId_fkey` FOREIGN KEY (`themeId`) REFERENCES `Undercovertheme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
