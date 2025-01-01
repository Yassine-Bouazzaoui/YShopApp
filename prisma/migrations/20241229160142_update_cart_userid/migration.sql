/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `cart_userId_key` ON `cart`(`userId`);
