import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { ProductService } from "./product.service";
import { ProductResponse, CreateProductRequest } from "../model/product.model";

@Controller('api/products/')
export class ProductController {
  constructor(private ProductService: ProductService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() request: CreateProductRequest
  ): Promise<WebResponse<ProductResponse>> {
    const response = await this.ProductService.create(request)
    return {
      data: response
    }
  }

  @Get(':categoryId')
  @HttpCode(200)
  async get(
    @Param('categoryId') categoryId: string
  ): Promise<WebResponse<ProductResponse>> {
    const response = await this.ProductService.get(categoryId)
    return {
      data: response
    }
  }
}