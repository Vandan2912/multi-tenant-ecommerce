-- CreateTable
CREATE TABLE "PageConfig" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sections_json" JSONB NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageConfig_tenant_id_idx" ON "PageConfig"("tenant_id");

-- CreateIndex
CREATE INDEX "PageConfig_tenant_id_page_type_idx" ON "PageConfig"("tenant_id", "page_type");

-- CreateIndex
CREATE UNIQUE INDEX "PageConfig_tenant_id_slug_key" ON "PageConfig"("tenant_id", "slug");

-- AddForeignKey
ALTER TABLE "PageConfig" ADD CONSTRAINT "PageConfig_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
