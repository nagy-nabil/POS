-- DropForeignKey
ALTER TABLE "OffersOnOrder" DROP CONSTRAINT "OffersOnOrder_offerId_fkey";

-- AddForeignKey
ALTER TABLE "OffersOnOrder" ADD CONSTRAINT "OffersOnOrder_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
