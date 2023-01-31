-- CreateTable
CREATE TABLE "productImages" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL DEFAULT 'nopic.png',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "productImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "productImages" ADD CONSTRAINT "productImages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
