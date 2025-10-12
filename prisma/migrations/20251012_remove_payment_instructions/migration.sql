-- Drop the payment instruction columns from the Setting table
ALTER TABLE "Setting" 
DROP COLUMN "bankTransferInstruction",
DROP COLUMN "cashPaymentInstruction",
DROP COLUMN "qrisPaymentInstruction";