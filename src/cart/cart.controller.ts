import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { Auth } from "../common/auth.decorator";
import { User } from "@prisma/client";
import { CartService } from "./cart.service";
import { AddItemCartRequest, CartResponse, UpdateItemCartRequest } from "../model/cart.model";

@Controller('api/carts/')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('items')
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: AddItemCartRequest
  ): Promise<WebResponse<CartResponse>> {
    request.userId = user.id
    const response = await this.cartService.addItem(request)
    return {
      data: response
    }
  }

  @Get()
  @HttpCode(200)
  async getAll(
    @Auth() user: User
  ): Promise<WebResponse<CartResponse[]>> {
    const response = await this.cartService.getAll(user)
    return {
      data: response
    }
  }

  @Patch('items')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateItemCartRequest
  ): Promise<WebResponse<CartResponse>> {
    request.userId = user.id
    const response = await this.cartService.updateItem(request)
    return {
      data: response
    }
  }
}