import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { CategoryService } from "./category.service";
import { CategoryResponse, CreateCategoryRequest } from "../model/category.model";

@Controller('api/categories/')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() request: CreateCategoryRequest
  ): Promise<WebResponse<CategoryResponse>> {
    const response = await this.categoryService.create(request)
    return {
      data: response
    }
  }
}