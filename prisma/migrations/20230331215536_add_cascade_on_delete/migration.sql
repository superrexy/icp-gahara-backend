-- DropForeignKey
ALTER TABLE `car_day_price` DROP FOREIGN KEY `car_day_price_car_id_fkey`;

-- DropForeignKey
ALTER TABLE `car_hour_price` DROP FOREIGN KEY `car_hour_price_car_id_fkey`;

-- AddForeignKey
ALTER TABLE `car_day_price` ADD CONSTRAINT `car_day_price_car_id_fkey` FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_hour_price` ADD CONSTRAINT `car_hour_price_car_id_fkey` FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
