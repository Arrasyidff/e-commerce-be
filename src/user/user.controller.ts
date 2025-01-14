import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { LoginUserRequest, RegisterUserRequest, UserResponse } from "../model/user.model";
import { WebResponse } from "../model/web.model";
import { Auth } from "../common/auth.decorator";
import { User } from "@prisma/client";

@Controller('api/users/')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserRequest
  ): Promise<WebResponse<UserResponse>> {
    const response = await this.userService.register(request)
    return {
      data: response
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest
  ): Promise<WebResponse<UserResponse>> {
    const response = await this.userService.login(request)
    return {
      data: response
    }
  }

  @Get()
  @HttpCode(200)
  async getAll(
    @Auth() user: User
  ): Promise<WebResponse<UserResponse[]>> {
    const response = await this.userService.getAll(user)
    return {
      data: response
    }
  }

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param('id') id: string
  ): Promise<WebResponse<UserResponse>> {
    const response = await this.userService.get(id)
    return {
      data: response
    }
  }
}