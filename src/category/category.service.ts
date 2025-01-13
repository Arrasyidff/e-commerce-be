import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CategoryResponse, CreateCategoryRequest } from "../model/category.model";
import { CategoryValidation } from "./category.validation";

@Injectable()
export class CategoryService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  async create(request: CreateCategoryRequest): Promise<CategoryResponse>
  {
    this.logger.info(`create new category ${JSON.stringify(request)}`);

    const createCategoryRequest : CreateCategoryRequest = this.validationService.validate(
      CategoryValidation.CREATE,
      request
    )

    const categoryExists = await this.prismaService.category.findUnique({
      where: {name: createCategoryRequest.name}
    });

    if (categoryExists) {
      throw new HttpException('Category already exists', 400);
    }

    const category = await this.prismaService.category.create({
      data: createCategoryRequest
    })

    return {
      id: category.id,
      name: category.name,
    }
  }
}