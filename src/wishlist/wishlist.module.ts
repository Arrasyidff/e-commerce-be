import { Module } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { WishlistController } from "./wishlist.controller";
import { ProductService } from "../product/product.service";
import { CategoryService } from "../category/category.service";
import { UserService } from "../user/user.service";

@Module({
  providers: [WishlistService, ProductService, CategoryService, UserService],
  controllers: [WishlistController],
})
export class WishlistModule {}