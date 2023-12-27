-- DropForeignKey
ALTER TABLE "ExpenseStore" DROP CONSTRAINT "ExpenseStore_typeId_fkey";

-- AlterTable
ALTER TABLE "ExpenseStore" ALTER COLUMN "typeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ExpenseStore" ADD CONSTRAINT "ExpenseStore_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ExpenseTypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
