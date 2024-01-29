-- CreateTable
CREATE TABLE `UndercoverthemesOnUsers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `undercoverthemeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UndercoverthemesOnUsers` ADD CONSTRAINT `UndercoverthemesOnUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UndercoverthemesOnUsers` ADD CONSTRAINT `UndercoverthemesOnUsers_undercoverthemeId_fkey` FOREIGN KEY (`undercoverthemeId`) REFERENCES `Undercovertheme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
