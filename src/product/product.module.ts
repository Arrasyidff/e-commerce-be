import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { CategoryService } from "../category/category.service";
import { UserService } from "../user/user.service";

@Module({
  providers: [ProductService, CategoryService, UserService],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule {}