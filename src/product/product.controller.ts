import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { ProductService } from "./product.service";
import { ProductResponse, CreateProductRequest, FilterProductRequest } from "../model/product.model";

@Controller('api/products/')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() request: CreateProductRequest
  ): Promise<WebResponse<ProductResponse>> {
    const response = await this.productService.create(request)
    return {
      data: response
    }
  }

  @Get()
  @HttpCode(200)
  async getAll(
    @Query('name') name?: string,
    @Query('price') price?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
    @Query('sortKey') sortKey?: string,
    @Query('sortOrder', new ParseIntPipe({ optional: true })) sortOrder?: number,
  ): Promise<WebResponse<ProductResponse[]>> {
    const request: FilterProductRequest = {
      name,
      price,
      page: page || 1,
      size: size || 10,
      sortKey: sortKey || 'created_at',
      sortOrder: sortOrder || 1,
    };
    return await this.productService.getAll(request);
  }

  @Get(':categoryId')
  @HttpCode(200)
  async get(
    @Param('categoryId') categoryId: string
  ): Promise<WebResponse<ProductResponse>> {
    const response = await this.productService.get(categoryId)
    return {
      data: response
    }
  }
}