-- AlterTable
ALTER TABLE `orders` ADD COLUMN `rent_hour_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_rent_hour_id_fkey` FOREIGN KEY (`rent_hour_id`) REFERENCES `car_hour_price`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
