import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { UserService } from "../user/user.service";

@Module({
  providers: [CategoryService, UserService],
  controllers: [CategoryController]
})
export class CategoryModule {}