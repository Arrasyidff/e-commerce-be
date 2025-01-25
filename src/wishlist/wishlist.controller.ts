import { Body, Controller, Delete, Get, HttpCode, Post } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { Auth } from "../common/auth.decorator";
import { User, WishlistItem } from "@prisma/client";
import { WishlistService } from "./wishlist.service";
import { AddWishlistRequest, WishlistResponse } from "../model/wishlist.model";

@Controller('api/wishlists/')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: AddWishlistRequest
  ): Promise<WebResponse<WishlistResponse>>
  {
    const response = await this.wishlistService.create(user, request)
    return {
      data: response
    }
  }

  @Get()
  @HttpCode(200)
  async getAllWishlistItems(
    @Auth() user: User,
  ): Promise<WebResponse<WishlistItem[]>>
  {
    const response = await this.wishlistService.getAllWishlistItems(user)
    return {
      data: response
    }
  }
}