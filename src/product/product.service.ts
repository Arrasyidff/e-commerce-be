import { Logger } from "winston";
import { ValidationService } from "../common/validation.service";
import { PrismaService } from "../common/prisma.service";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { ProductResponse, CreateProductRequest, FilterProductRequest, UpdateProductRequest } from "../model/product.model";
import { ProductValidation } from "./product.validation";
import { Decimal } from "@prisma/client/runtime/library";
import { Product, User } from "@prisma/client";
import { WebResponse } from "../model/web.model";
import { CategoryService } from "../category/category.service";
import { UserService } from "../user/user.service";

@Injectable()
export class ProductService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  async create(user: User, request: CreateProductRequest): Promise<ProductResponse>
  {
    this.logger.info(`Create new product ${JSON.stringify(request)}`);
    
    this.userService.adminValidation(user)

    const createProductRequest : CreateProductRequest = this.validationService.validate(
      ProductValidation.CREATE,
      request
    )

    await this.categoryService.get(createProductRequest.categoryId)

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
    this.logger.info('Get all products');

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

    let product = await this.getProductById(productId)
    if (!product) {
      throw new HttpException('Product is not found', 404)
    }

    return this.toProductResponse(product)
  }

  async update(user: User, request: UpdateProductRequest): Promise<ProductResponse>
  {
    this.logger.info(`Update product ${JSON.stringify(request)}`);

    this.userService.adminValidation(user)

    const updateProductRequest : UpdateProductRequest = this.validationService.validate(
      ProductValidation.UPDATE,
      request
    )

    let product = await this.getProductById(updateProductRequest.id)
    if (!product) {
      throw new HttpException('Product is not found', 404)
    }

    if (updateProductRequest.name) {
      product.name = updateProductRequest.name
    }

    if (updateProductRequest.description) {
      product.description = updateProductRequest.description
    }

    if (updateProductRequest.price) {
      product.price = new Decimal(updateProductRequest.price)
    }

    if (updateProductRequest.stock) {
      product.stock = updateProductRequest.stock
    }

    if (updateProductRequest.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: {id: updateProductRequest.categoryId}
      })

      if (!category) {
        throw new HttpException('Category is not found', 404)
      }
      product.categoryId = updateProductRequest.categoryId
    }

    product = await this.prismaService.product.update({
      where: {id: updateProductRequest.id},
      data: product
    })

    return this.toProductResponse(product)
  }

  async delete(user: User, id: string): Promise<ProductResponse>
  {
    this.logger.info(`Delete product id ${id}`);

    this.userService.adminValidation(user)

    let product = await this.getProductById(id)
    if (!product) {
      throw new HttpException('Product is not found', 404)
    }

    await this.prismaService.product.delete({
      where: {id: id}
    })

    return this.toProductResponse(product)
  }

  async getProductById(id: string): Promise<Product | null>
  {
    return this.prismaService.product.findUnique({
      where: {id: id}
    })
  }

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
}