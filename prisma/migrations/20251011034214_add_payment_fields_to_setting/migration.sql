-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "bankAccountName" VARCHAR(100),
ADD COLUMN     "bankAccountNumber" VARCHAR(50),
ADD COLUMN     "bankCode" VARCHAR(10),
ADD COLUMN     "bankName" VARCHAR(100),
ADD COLUMN     "bankTransferInstruction" TEXT,
ADD COLUMN     "cashPaymentInstruction" TEXT,
ADD COLUMN     "qrisImage" VARCHAR(255),
ADD COLUMN     "qrisPaymentInstruction" TEXT;
