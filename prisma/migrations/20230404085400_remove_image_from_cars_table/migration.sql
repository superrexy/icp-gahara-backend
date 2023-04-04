/*
  Warnings:

  - You are about to drop the column `image` on the `cars` table. All the data in the column will be lost.
  - You are about to alter the column `expired_at` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the `car_galleries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `car_galleries` DROP FOREIGN KEY `car_galleries_car_id_fkey`;

-- AlterTable
ALTER TABLE `cars` DROP COLUMN `image`;

-- AlterTable
ALTER TABLE `payment` MODIFY `expired_at` DATETIME NOT NULL;

-- DropTable
DROP TABLE `car_galleries`;

-- CreateTable
CREATE TABLE `car_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `car_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `car_images` ADD CONSTRAINT `car_images_car_id_fkey` FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
