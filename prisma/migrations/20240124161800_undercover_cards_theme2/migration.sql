/*
  Warnings:

  - You are about to drop the `UndercoverCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UndercoverTheme` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UndercoverCard` DROP FOREIGN KEY `UndercoverCard_themeId_fkey`;

-- DropTable
DROP TABLE `UndercoverCard`;

-- DropTable
DROP TABLE `UndercoverTheme`;

-- CreateTable
CREATE TABLE `Undercovercard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,
    `themeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Undercovertheme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `theme` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Undercovercard` ADD CONSTRAINT `Undercovercard_themeId_fkey` FOREIGN KEY (`themeId`) REFERENCES `Undercovertheme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
