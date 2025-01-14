import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { ProductResponse, CreateProductRequest, FilterProductRequest } from "../model/product.model";
import { ProductValidation } from "./product.validation";
import { Decimal } from "@prisma/client/runtime/library";
import { Product } from "@prisma/client";
import { WebResponse } from "src/model/web.model";

@Injectable()
export class ProductService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  toProductResponse(product: Product): ProductResponse
  {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId
    }
  }

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

    return this.toProductResponse(product)
  }

  async getAll(request: FilterProductRequest): Promise<WebResponse<ProductResponse[]>>
  {
    const filterProductRequest: FilterProductRequest = this.validationService.validate(
      ProductValidation.FILTER,
      request,
    );
    
    const filters = [];
    if (filterProductRequest.name) {
      filters.push({
        OR: [
          {
            name: {
              contains: filterProductRequest.name,
            },
          },
          {
            description: {
              contains: filterProductRequest.name,
            },
          },
        ],
      });
    }
    if (filterProductRequest.price) {
      filters.push({
        price: filterProductRequest.price,
      });
    }

    let sortOrder = {}
    if (filterProductRequest.sortKey && filterProductRequest.sortOrder) {
      sortOrder = {
        [filterProductRequest.sortKey]: filterProductRequest.sortOrder === 1 ? 'desc' : 'asc',
      };
    } else {
      sortOrder = {created_at: 'desc'}
    }

    const skip = filterProductRequest.size * (filterProductRequest.page - 1);
    const products = await this.prismaService.product.findMany({
      where: {
        AND: filters,
      },
      take: filterProductRequest.size,
      skip,
      orderBy: sortOrder
    });
    const total = await this.prismaService.product.count();
    
    return {
      data: products.map((product: Product) => this.toProductResponse(product)),
      pagging: {
        size: filterProductRequest.size,
        current_page: filterProductRequest.page,
        total: Math.ceil(total / filterProductRequest.size),
      },
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

    return this.toProductResponse(product)
  }
}