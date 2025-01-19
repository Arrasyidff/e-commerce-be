import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { OrderValidation } from "./order.validation";
import { CartItem, Order, Product, User } from "@prisma/client";
import { CreateOrderRequest, FilterOrderRequest, OrderResponse } from "../model/order.model";
import { Decimal } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

@Injectable()
export class OrderService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  toOrderResponse(order: Order): OrderResponse
  {
    return {
      id: order.id,
      userId: order.id,
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      paymentMethod: order.paymentMethod,
    }
  }

  async createOrder(user: User, request: CreateOrderRequest): Promise<OrderResponse>
  {
    try {
      const createOrderRequest: CreateOrderRequest = this.validationService.validate(
        OrderValidation.CREATE,
        request
      )
  
      const cart = await this.prismaService.cart.findUnique({
        where: {userId: user.id}
      })
  
      if (!cart) {
        throw new HttpException('Cart is not found', 404)
      }
  
      const cartItems = await this.prismaService.cartItem.findMany({
        where: {cartId: cart.id}
      })
  
      if (cartItems.length == 0) {
        throw new HttpException('Cart items is not found', 404)
      }

      const productIds = cartItems.map(item => item.productId);
      const products = await this.prismaService.product.findMany({
        where: {id: { in: productIds }}
      });

      let order = null
  
      await this.prismaService.$transaction(async (tx) => {
        const productMap = products.reduce((acc, product: Product) => {
          acc[product.id] = product.price.toString();
          return acc;
        }, {} as Record<string, string>);

        const totalAmount = cartItems.reduce((sum, item) => {
          const productPrice = parseFloat(productMap[item.productId] || '0');
          return sum + (productPrice * item.quantity);
        }, 0);

        order = await tx.order.create({
          data: {
            userId: user.id,
            totalAmount: new Decimal(totalAmount),
            status: 'Pending',
            paymentMethod: createOrderRequest.payment_method
          }
        })

        const orderItemsData = cartItems.map((item: CartItem) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: new Decimal(parseFloat(productMap[item.productId] || '0') * item.quantity),
        }));

        await tx.orderItem.createMany({
          data: orderItemsData
        })

        await tx.cartItem.deleteMany({
          where: {cartId: cart.id}
        })
      })

      if (!order) {
        throw new HttpException('Invalid create order', 400)
      }

      order = order as Order
      return this.toOrderResponse(order)
    } catch (error) {
      if (error instanceof ZodError) {
        throw error
      } else if (error instanceof HttpException) {
        throw new HttpException(error.getResponse(), error.getStatus())
      } else {
        throw new HttpException('Transaction error', 500)
      }
    }
  }

  async getOrder(id: string): Promise<OrderResponse>
  {
    const order = await this.prismaService.order.findUnique({
      where: {id: id}
    })

    if (!order) {
      throw new HttpException('Order is not found', 404)
    }

    return this.toOrderResponse(order)
  }

  async getAllOrder(user: User, request: FilterOrderRequest): Promise<OrderResponse[]>
  {
    const filterOrderRequest: FilterOrderRequest = this.validationService.validate(
      OrderValidation.FILTER,
      request,
    );

    const filters = [];
    filters.push({userId: user.id})
    if (filterOrderRequest.status) {
      filters.push({
        status: {
          contains: filterOrderRequest.status,
        }
      });
    }

    const orders = await this.prismaService.order.findMany({
      where: {
        AND: filters
      }
    })

    return orders.map((order: Order) => this.toOrderResponse(order))
  }
}