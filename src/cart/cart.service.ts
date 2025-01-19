import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CartValidation } from "./cart.validation";
import { Cart, User } from "@prisma/client";
import { AddItemCartRequest, CartResponse } from "src/model/cart.model";

@Injectable()
export class CartService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  toCartResponse(cart: Cart): CartResponse
  {
    return {
      id: cart.id,
      userId: cart.userId
    }
  }

  async addItem(request: AddItemCartRequest): Promise<CartResponse>
  {
    const addItemCartRequest: AddItemCartRequest = this.validationService.validate(
      CartValidation.ADD_ITEM,
      request
    )

    let cart = await this.prismaService.cart.findUnique({
      where: {userId: addItemCartRequest.userId}
    })

    if (!cart) {
      cart = await this.prismaService.cart.create({
        data: {userId: addItemCartRequest.userId}
      })
    }

    await this.prismaService.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: addItemCartRequest.productId
        }
      },
      create: {
        cartId: cart.id,
        productId: addItemCartRequest.productId,
        quantity: addItemCartRequest.quantity
      },
      update: {
        quantity: {
          increment: addItemCartRequest.quantity
        },
      },
    })

    return this.toCartResponse(cart)
  }

  async getAll(user: User): Promise<CartResponse[]>
  {
    const carts = await this.prismaService.cart.findMany({
      where: {userId: user.id}
    })

    return carts.map((cart: Cart) => this.toCartResponse(cart))
  }
  
}