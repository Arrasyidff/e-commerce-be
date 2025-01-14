import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CategoryResponse, CreateCategoryRequest } from "../model/category.model";
import { CategoryValidation } from "./category.validation";
import { Category } from "@prisma/client";

@Injectable()
export class CategoryService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  toCategoryResponse(category: Category): CategoryResponse
  {
    return {
      id: category.id,
      name: category.name
    }
  }

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

    return this.toCategoryResponse(category)
  }

  async getAll(): Promise<CategoryResponse[]>
  {
    this.logger.info(`get all categories`);

    const categories = await this.prismaService.category.findMany()

    return categories.map((category: Category) => this.toCategoryResponse(category))
  }

  async get(id: string): Promise<CategoryResponse>
  {
    this.logger.info(`get category by id ${id}`);

    const category = await this.prismaService.category.findUnique({
      where: {id: id}
    })

    if (!category) {
      throw new HttpException('Category is not found', 404)
    }

    return this.toCategoryResponse(category)
  }
}