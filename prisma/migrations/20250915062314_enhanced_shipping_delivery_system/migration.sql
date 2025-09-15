-- CreateEnum
CREATE TYPE "public"."ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'RETURN_REQUESTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'RETURN_APPROVED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'RETURN_REJECTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'REPLACEMENT_REQUESTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'REPLACEMENT_APPROVED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'REPLACEMENT_REJECTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'RETURNED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'REPLACED';

-- AlterEnum
ALTER TYPE "public"."PaymentMethod" ADD VALUE 'RAZORPAY';

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "awbCode" TEXT,
ADD COLUMN     "carrierName" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT,
ADD COLUMN     "replacementApprovedAt" TIMESTAMP(3),
ADD COLUMN     "replacementOrderId" TEXT,
ADD COLUMN     "replacementReason" TEXT,
ADD COLUMN     "replacementRejectedAt" TIMESTAMP(3),
ADD COLUMN     "replacementRequestedAt" TIMESTAMP(3),
ADD COLUMN     "returnApprovedAt" TIMESTAMP(3),
ADD COLUMN     "returnReason" TEXT,
ADD COLUMN     "returnRejectedAt" TIMESTAMP(3),
ADD COLUMN     "returnRequestedAt" TIMESTAMP(3),
ADD COLUMN     "returnTrackingNumber" TEXT,
ADD COLUMN     "shipmentId" TEXT,
ADD COLUMN     "shipmentStatus" TEXT,
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "public"."ReturnRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "status" "public"."ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_orderId_userId_key" ON "public"."ReturnRequest"("orderId", "userId");

-- AddForeignKey
ALTER TABLE "public"."ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
