import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { User, Wishlist } from "@prisma/client";
import { AddWishlistRequest, WishlistResponse } from "src/model/wishlist.model";
import { WishlistValidation } from "./wishlist.validation";
import { ZodError } from "zod";
import { ProductService } from "../product/product.service";

@Injectable()
export class WishlistService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private productService: ProductService
  ) {}

  async create(user: User, request: AddWishlistRequest): Promise<WishlistResponse>
  {
    try {
      this.logger.info(`Create new wishlist ${JSON.stringify(request)}`);

      const addWishlistRequest: AddWishlistRequest = this.validationService.validate(
        WishlistValidation.ADD_ITEM,
        request
      )

      const product = await this.productService.getProductById(addWishlistRequest.productId)
      if (!product) {
        throw new HttpException('Product is not found', 404)
      }

      let wishlist = null
      await this.prismaService.$transaction(async (tx) => {
        wishlist = await tx.wishlist.findUnique({
          where: {userId: user.id}
        })

        if (!wishlist) {
          wishlist = await tx.wishlist.create({
            data: {userId: user.id}
          })
        }

        const wishlistItem = await tx.wishlistItem.findUnique({
          where: {
            wishlistId_productId: {
              wishlistId: wishlist.id,
              productId: addWishlistRequest.productId,
            }
          }
        })

        if (wishlistItem) {
          throw new HttpException('Wishlist item already exists', 400)
        }

        await tx.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId: addWishlistRequest.productId
          }
        })
      })

      if (!wishlist) {
        throw new HttpException('Invalid create wishlist', 400)
      }

      wishlist = wishlist as Wishlist
      return {
        id: wishlist.id,
        userId: wishlist.userId
      }
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
}