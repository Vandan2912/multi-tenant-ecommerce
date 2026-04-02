/*
  Warnings:

  - You are about to drop the column `discount_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Variant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,product_id,name]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Variant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parent_id" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "discount_price",
DROP COLUMN "price",
DROP COLUMN "stock",
ADD COLUMN     "brand_id" TEXT,
ADD COLUMN     "specs_json" JSONB;

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "label",
DROP COLUMN "options",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount_price" DECIMAL(10,2),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "options_json" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT;

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brand_tenant_id_idx" ON "Brand"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_tenant_id_slug_key" ON "Brand"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "Category_tenant_id_parent_id_idx" ON "Category"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "Product_tenant_id_category_id_idx" ON "Product"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "Product_tenant_id_brand_id_idx" ON "Product"("tenant_id", "brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_tenant_id_product_id_name_key" ON "Variant"("tenant_id", "product_id", "name");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
