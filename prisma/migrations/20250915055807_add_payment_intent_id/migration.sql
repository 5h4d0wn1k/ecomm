-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "paymentIntentId" TEXT;

-- CreateTable
CREATE TABLE "public"."ShippingPolicy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPolicy_pkey" PRIMARY KEY ("id")
);
