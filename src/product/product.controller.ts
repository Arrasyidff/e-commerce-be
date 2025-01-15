import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { ProductService } from "./product.service";
import { ProductResponse, CreateProductRequest, FilterProductRequest, UpdateProductRequest } from "../model/product.model";
import { User } from "@prisma/client";
import { Auth } from "../common/auth.decorator";

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

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param('id') id: string
  ): Promise<WebResponse<ProductResponse>> {
    const response = await this.productService.get(id)
    return {
      data: response
    }
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id') id: string,
    @Body() request: UpdateProductRequest
  ): Promise<WebResponse<ProductResponse>> {
    request.id = id
    const response = await this.productService.update(user, request)
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
    await this.productService.delete(user, id)
    return {
      data: 'Ok'
    }
  }
}