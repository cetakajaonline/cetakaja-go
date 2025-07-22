/*
  Warnings:

  - The primary key for the `ApiToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ApiToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `createdBy` on the `ApiToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ApiToken" DROP CONSTRAINT "ApiToken_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
