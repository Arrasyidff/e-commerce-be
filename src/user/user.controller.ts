import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from "../model/user.model";
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

  @Patch()
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateUserRequest
  ): Promise<WebResponse<UserResponse>> {
    request.id = user.id;
    const response = await this.userService.update(user, request);
    return {
      data: response
    }
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(
    @Auth() user: User,
    @Param('id') id: string
  ): Promise<WebResponse<string>> {
    await this.userService.delete(user, id);
    return {
      data: 'Ok'
    }
  }
}