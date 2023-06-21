/*
  Warnings:

  - You are about to drop the column `priceAtSale` on the `ProductsOnOrder` table. All the data in the column will be lost.
  - Added the required column `buyPriceAtSale` to the `ProductsOnOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellPriceAtSale` to the `ProductsOnOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductsOnOrder" DROP COLUMN "priceAtSale",
ADD COLUMN     "buyPriceAtSale" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellPriceAtSale" DOUBLE PRECISION NOT NULL;
