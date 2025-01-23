import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "../model/category.model";
import { CategoryValidation } from "./category.validation";
import { Category, User } from "@prisma/client";
import { UserService } from "../user/user.service";

@Injectable()
export class CategoryService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private userService: UserService
  ) {}

  async create(user: User, request: CreateCategoryRequest): Promise<CategoryResponse>
  {
    this.logger.info(`Create new category ${JSON.stringify(request)}`);

    this.userService.adminValidation(user)

    const createCategoryRequest : CreateCategoryRequest = this.validationService.validate(
      CategoryValidation.CREATE,
      request
    )

    const categoryExists = await this.prismaService.category.findUnique({
      where: {name: createCategoryRequest.name}
    });
    if (categoryExists) throw new HttpException('Category already exists', 400);

    const category = await this.prismaService.category.create({
      data: createCategoryRequest
    })

    return this.toCategoryResponse(category)
  }

  async getAll(): Promise<CategoryResponse[]>
  {
    this.logger.info(`Get all categories`);

    const categories = await this.prismaService.category.findMany()
    return categories.map((category: Category) => this.toCategoryResponse(category))
  }

  async get(id: string): Promise<CategoryResponse>
  {
    this.logger.info(`Get category by id ${id}`);

    const category = await this.getCategoryById(id)
    if (!category) throw new HttpException('Category is not found', 404)

    return this.toCategoryResponse(category)
  }

  async update(user: User, request: UpdateCategoryRequest): Promise<CategoryResponse>
  {
    this.logger.info(`Update category ${JSON.stringify(request)}`);

    this.userService.adminValidation(user)

    const updateCategoryRequest : UpdateCategoryRequest = this.validationService.validate(
      CategoryValidation.UPDATE,
      request
    )

    let category = await this.getCategoryById(updateCategoryRequest.id)
    if (!category) throw new HttpException('Category is not found', 404)

    if (updateCategoryRequest.name) {
      category.name = updateCategoryRequest.name
    }

    category = await this.prismaService.category.update({
      where: {id: updateCategoryRequest.id},
      data: updateCategoryRequest
    })

    return this.toCategoryResponse(category)
  }

  async delete(user: User, id: string): Promise<CategoryResponse>
  {
    this.logger.info(`Delete category id ${id}`);

    this.userService.adminValidation(user)

    let category = await this.getCategoryById(id)
    if (!category) throw new HttpException('Category is not found', 404)

    await this.prismaService.category.delete({
      where: {id: id}
    })

    return this.toCategoryResponse(category)
  }

  async getCategoryById(id: string): Promise<Category | null>
  {
    return await this.prismaService.category.findUnique({where: {id: id}})
  }

  toCategoryResponse(category: Category): CategoryResponse
  {
    return {
      id: category.id,
      name: category.name
    }
  }
}