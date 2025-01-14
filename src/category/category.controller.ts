import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { CategoryService } from "./category.service";
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "../model/category.model";
import { Auth } from "../common/auth.decorator";
import { User } from "@prisma/client";

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

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id') id: string,
    @Body() request: UpdateCategoryRequest
  ): Promise<WebResponse<CategoryResponse>> {
    request.id = id;
    const response = await this.categoryService.update(user, request)
    return {
      data: response
    }
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(
    @Auth() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<string>> {
    await this.categoryService.delete(user, id)
    return {
      data: "Ok"
    }
  }
}