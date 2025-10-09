-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('operasional', 'marketing', 'gaji', 'lainnya');

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "nominal" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255),
    "proofFile" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");
