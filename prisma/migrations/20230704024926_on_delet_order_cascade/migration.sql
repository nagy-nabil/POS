-- DropForeignKey
ALTER TABLE "ProductsOnOrder" DROP CONSTRAINT "ProductsOnOrder_orderId_fkey";

-- AddForeignKey
ALTER TABLE "ProductsOnOrder" ADD CONSTRAINT "ProductsOnOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
