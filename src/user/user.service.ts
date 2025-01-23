import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "../common/prisma.service";
import { ValidationService } from "../common/validation.service";
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from "../model/user.model";
import { Logger } from "winston";
import { UserValidation } from "./user.validation";
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { User } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse>
  {
    this.logger.info(`Register new user ${JSON.stringify(request)}`);

    const registerUserRequest : RegisterUserRequest = this.validationService.validate(
      UserValidation.REGISTER,
      request
    )

    const userExists = await this.getUserByEmail(registerUserRequest.email);
    if (userExists) throw new HttpException('Email already registered', 400);

    registerUserRequest.password = await bcrypt.hash(
      registerUserRequest.password,
      10
    )

    const user = await this.prismaService.user.create({
      data: registerUserRequest
    })

    return this.toUserResponse(user)
  }

  async login(request: LoginUserRequest): Promise<UserResponse>
  {
    this.logger.info(`Login user ${JSON.stringify(request)}`);

    const loginUserRequest : LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request
    )

    const user = await this.getUserByEmail(loginUserRequest.email)
    if (!user) throw new HttpException('User is not found', 404)

    const isPasswordValid = await bcrypt.compare(
      loginUserRequest.password,
      user.password
    )

    if (!isPasswordValid) {
      throw new HttpException('Email or password is invalid', 401);
    }

    const token = await jwt.sign(
      {id: user.id, email: user.email},
      'secret',
      // {expiresIn: '1h'}
    )

    return {...this.toUserResponse(user), token: token}
  }

  async getAll(user: User): Promise<UserResponse[]>
  {
    this.logger.info('Get all users');

    await this.adminValidation(user)

    const users = await this.prismaService.user.findMany()
    return users.map((user: User) => this.toUserResponse(user))
  }

  async get(id: string): Promise<UserResponse>
  {
    this.logger.info('Get detail user');

    const user = await this.getUserById(id)
    if (!user) throw new HttpException('User is not found', 404)

    return this.toUserResponse(user)
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse>
  {
    this.logger.info(`Update user ${JSON.stringify(request)}`);

    const updateUserRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request
    )

    if (updateUserRequest.email) {
      let userEmailExists = await this.prismaService.user.findFirst({
        where: {
          email: updateUserRequest.email,
          id: {not: user.id}
        }
      })
      if (userEmailExists) throw new HttpException('Email already exists', 400)
      user.email = updateUserRequest.email
    }

    if (updateUserRequest.username) {
      user.username = updateUserRequest.username
    }

    if (updateUserRequest.password) {
      user.password = await bcrypt.hash(
        updateUserRequest.password,
        10
      )
    }

    if (updateUserRequest.role) {
      user.role = updateUserRequest.role
    }

    user = await this.prismaService.user.update({
      where: {id: updateUserRequest.id},
      data: updateUserRequest
    })

    return this.toUserResponse(user)
  }

  async delete(userLogin: User, id: string): Promise<UserResponse>
  {
    this.logger.info(`Delete user by id ${id}`);

    await this.adminValidation(userLogin)

    const user = await this.getUserById(id)
    if (!user) throw new HttpException('User is not found', 404)

    await this.prismaService.user.delete({where: {id: id}})

    return this.toUserResponse(user)
  }

  adminValidation(user: User): void
  {
    if (user.role !== 'admin') {
      throw new HttpException('Access denied', 403)
    }
  }

  async getUserById(id: string): Promise<User>
  {
    let user = await this.prismaService.user.findUnique({where: {id: id}})
    return user
  }

  async getUserByEmail(email: string): Promise<User>
  {
    let user = await this.prismaService.user.findUnique({where: {email: email}})
    return user
  }

  toUserResponse(user: User): UserResponse
  {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  }
}