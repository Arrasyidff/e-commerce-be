/*
  Warnings:

  - A unique constraint covering the columns `[wishlistId,productId]` on the table `wishlist_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_wishlistId_productId_key" ON "wishlist_items"("wishlistId", "productId");
