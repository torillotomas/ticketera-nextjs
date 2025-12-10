/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Ticket` table. All the data in the column will be lost.
  - The `status` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "updatedAt",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN',
DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
