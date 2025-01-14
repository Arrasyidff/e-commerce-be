import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
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

  @Get()
  @HttpCode(200)
  async getAll(): Promise<WebResponse<CategoryResponse[]>> {
    const response = await this.categoryService.getAll()
    return {
      data: response
    }
  }

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param('id') id: string
  ): Promise<WebResponse<CategoryResponse>> {
    const response = await this.categoryService.get(id)
    return {
      data: response
    }
  }
}