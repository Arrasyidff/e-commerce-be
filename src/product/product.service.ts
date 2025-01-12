import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { ProductResponse, CreateProductRequest } from "../model/product.model";
import { ProductValidation } from "./product.validation";
import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class ProductService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  async create(request: CreateProductRequest): Promise<ProductResponse>
  {
    this.logger.info(`Create new product ${JSON.stringify(request)}`);

    const createProductRequest : CreateProductRequest = this.validationService.validate(
      ProductValidation.CREATE,
      request
    )

    const category = await this.prismaService.category.findUnique({
      where: {id: createProductRequest.categoryId}
    })

    if (!category) {
      throw new HttpException('Category is not found', 404)
    }

    const product = await this.prismaService.product.create({
      data: {
        ...createProductRequest,
        price: new Decimal(createProductRequest.price)
      }
    })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId
    }
  }

  async get(productId: string): Promise<ProductResponse>
  {
    this.logger.info(`Get one product ${JSON.stringify(productId)}`);

    const product = await this.prismaService.product.findUnique({
      where: {id: productId}
    })

    if (!product) {
      throw new HttpException('Product is not found', 404)
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId
    }
  }
}