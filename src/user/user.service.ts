import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "../common/prisma.service";
import { ValidationService } from "../common/validation.service";
import { RegisterUserRequest, UserResponse } from "src/model/user.model";
import { Logger } from "winston";
import { UserValidation } from "./user.validation";
import * as bcrypt from 'bcrypt'

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

    const registerUserRequest = this.validationService.validate(
      UserValidation.REGISTER,
      request
    )

    const userExists = await this.prismaService.user.findFirst({
      where: {email: registerUserRequest.email}
    });

    if (userExists) {
      throw new HttpException('Email already registered', 400);
    }

    registerUserRequest.password = await bcrypt.hash(
      registerUserRequest.password,
      10
    )

    const user = await this.prismaService.user.create({
      data: registerUserRequest
    })

    return {
      username: user.username,
      email: user.email,
      role: user.role
    }
  }
}