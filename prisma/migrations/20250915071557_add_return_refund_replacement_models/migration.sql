/*
  Warnings:

  - You are about to drop the column `paymentIntentId` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ReplacementStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "paymentIntentId";

-- CreateTable
CREATE TABLE "public"."Refund" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" "public"."RefundStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "razorpayRefundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Replacement" (
    "id" TEXT NOT NULL,
    "originalOrderId" TEXT NOT NULL,
    "replacementOrderId" TEXT,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "status" "public"."ReplacementStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Replacement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Replacement" ADD CONSTRAINT "Replacement_originalOrderId_fkey" FOREIGN KEY ("originalOrderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Replacement" ADD CONSTRAINT "Replacement_replacementOrderId_fkey" FOREIGN KEY ("replacementOrderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Replacement" ADD CONSTRAINT "Replacement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
