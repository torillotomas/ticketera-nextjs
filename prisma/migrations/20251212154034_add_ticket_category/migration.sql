-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('ACCESS', 'HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "category" "TicketCategory" NOT NULL DEFAULT 'OTHER';
