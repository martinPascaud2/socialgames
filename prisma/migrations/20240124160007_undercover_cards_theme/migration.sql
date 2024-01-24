-- CreateTable
CREATE TABLE `UndercoverCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,
    `themeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UndercoverTheme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `theme` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UndercoverCard` ADD CONSTRAINT `UndercoverCard_themeId_fkey` FOREIGN KEY (`themeId`) REFERENCES `UndercoverTheme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
