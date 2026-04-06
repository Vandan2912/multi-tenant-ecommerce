/*
  Warnings:

  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_tenant_id_fkey";

-- DropTable
DROP TABLE "Coupon";

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "minimum_order_value" DECIMAL(10,2),
    "maximum_discount" DECIMAL(10,2),
    "usage_limit" INTEGER,
    "usage_limit_per_user" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "applicable_products" TEXT[],
    "applicable_categories" TEXT[],
    "excluded_products" TEXT[],
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoUsage" (
    "id" TEXT NOT NULL,
    "promo_code_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "order_id" TEXT,
    "discount_given" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromoCode_tenant_id_idx" ON "PromoCode"("tenant_id");

-- CreateIndex
CREATE INDEX "PromoCode_tenant_id_is_active_idx" ON "PromoCode"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_tenant_id_code_key" ON "PromoCode"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "PromoUsage_promo_code_id_idx" ON "PromoUsage"("promo_code_id");

-- CreateIndex
CREATE INDEX "PromoUsage_tenant_id_identifier_idx" ON "PromoUsage"("tenant_id", "identifier");

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoUsage" ADD CONSTRAINT "PromoUsage_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
