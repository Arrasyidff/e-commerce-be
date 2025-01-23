import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { WebResponse } from "../model/web.model";
import { Auth } from "../common/auth.decorator";
import { User } from "@prisma/client";
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
}