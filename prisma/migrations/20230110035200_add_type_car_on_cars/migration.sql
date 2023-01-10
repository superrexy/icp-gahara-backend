/*
  Warnings:

  - Added the required column `type_car` to the `cars` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cars` ADD COLUMN `type_car` VARCHAR(255) NOT NULL;
