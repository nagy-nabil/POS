-- CreateTable
CREATE TABLE "Loss" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "additionalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Loss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductsOnLoss" (
    "lossId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "buyPriceAtLoss" DOUBLE PRECISION NOT NULL,
    "sellPriceAtLoss" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductsOnLoss_pkey" PRIMARY KEY ("productId","lossId")
);

-- AddForeignKey
ALTER TABLE "Loss" ADD CONSTRAINT "Loss_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnLoss" ADD CONSTRAINT "ProductsOnLoss_lossId_fkey" FOREIGN KEY ("lossId") REFERENCES "Loss"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnLoss" ADD CONSTRAINT "ProductsOnLoss_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
