import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { Auth } from "../common/auth.decorator";
import { User } from "@prisma/client";
import { OrderService } from "./order.service";
import { CreateOrderRequest, FilterOrderRequest, OrderResponse, UpdateOrderRequest } from "../model/order.model";

@Controller('api/orders/')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateOrderRequest
  ): Promise<WebResponse<OrderResponse>> {
    const response = await this.orderService.createOrder(user, request)
    return {
      data: response
    }
  }

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param('id') id: string
  ): Promise<WebResponse<OrderResponse>>
  {
    const response = await this.orderService.getOrder(id)
    return {
      data: response
    }
  }

  @Get()
  @HttpCode(200)
  async getAll(
    @Auth() user: User,
    @Query('status') status?: string,
  ): Promise<WebResponse<OrderResponse[]>> {
    const request: FilterOrderRequest = {
      status,
    };
    const response = await this.orderService.getAllOrder(user, request);
    return {
      data: response
    }
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id') id: string,
    @Body() request: UpdateOrderRequest,
  ): Promise<WebResponse<OrderResponse>> {
    request.id = id
    const response = await this.orderService.updateOrder(user, request);
    return {
      data: response
    }
  }
}