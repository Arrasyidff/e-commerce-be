import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CartValidation } from "./cart.validation";
import { Cart, User } from "@prisma/client";
import { AddItemCartRequest, CartResponse, UpdateItemCartRequest } from "src/model/cart.model";

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
  
  async updateItem(request: UpdateItemCartRequest): Promise<CartResponse>
  {
    const updateItemCartRequest: UpdateItemCartRequest = this.validationService.validate(
      CartValidation.UPDATE_ITEM,
      request
    )

    let cart = await this.prismaService.cart.findUnique({
      where: {userId: updateItemCartRequest.userId}
    })

    if (!cart) {
      throw new HttpException('Cart is not found', 404)
    }

    const cartItem = await this.prismaService.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: updateItemCartRequest.productId
        }
      }
    })

    if (!cartItem) {
      throw new HttpException('Cart is not found', 404)
    }

    cartItem.quantity = updateItemCartRequest.quantity
    await this.prismaService.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: updateItemCartRequest.productId
        }
      },
      data: cartItem
    })

    return this.toCartResponse(cart)
  }

  async deleteItem(user: User, id: string): Promise<CartResponse>
  {
    let cart = await this.prismaService.cart.findUnique({
      where: {userId: user.id}
    })

    if (!cart) {
      throw new HttpException('Cart is not found', 404)
    }

    const cartItem = await this.prismaService.cartItem.findUnique({
      where: {id: id}
    })

    if (!cartItem) {
      throw new HttpException('Cart is not found', 404)
    }

    await this.prismaService.cartItem.delete({
      where: {id: id}
    })

    return this.toCartResponse(cart)
  }
}