-- CreateTable
CREATE TABLE "ExpenseTypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ExpenseTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseStore" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "onTheFly" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION NOT NULL,
    "remindAt" TIMESTAMP(3),
    "typeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ExpenseStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expenses" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "additionalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendingsOnExpenses" (
    "spendingId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,

    CONSTRAINT "SpendingsOnExpenses_pkey" PRIMARY KEY ("spendingId","expenseId")
);

-- AddForeignKey
ALTER TABLE "ExpenseTypes" ADD CONSTRAINT "ExpenseTypes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseStore" ADD CONSTRAINT "ExpenseStore_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ExpenseTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseStore" ADD CONSTRAINT "ExpenseStore_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendingsOnExpenses" ADD CONSTRAINT "SpendingsOnExpenses_spendingId_fkey" FOREIGN KEY ("spendingId") REFERENCES "ExpenseStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendingsOnExpenses" ADD CONSTRAINT "SpendingsOnExpenses_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
