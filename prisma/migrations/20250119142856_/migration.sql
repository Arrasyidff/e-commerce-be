/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `wishlists` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wishlists_userId_key" ON "wishlists"("userId");
