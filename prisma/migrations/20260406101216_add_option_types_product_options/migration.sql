-- CreateTable
CREATE TABLE "OptionType" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "values_json" JSONB NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "option_type_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "selected_values_json" JSONB NOT NULL,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OptionType_tenant_id_idx" ON "OptionType"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "OptionType_tenant_id_name_key" ON "OptionType"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "ProductOption_product_id_idx" ON "ProductOption"("product_id");

-- CreateIndex
CREATE INDEX "ProductOption_tenant_id_idx" ON "ProductOption"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_product_id_option_type_id_key" ON "ProductOption"("product_id", "option_type_id");

-- AddForeignKey
ALTER TABLE "OptionType" ADD CONSTRAINT "OptionType_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_option_type_id_fkey" FOREIGN KEY ("option_type_id") REFERENCES "OptionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
