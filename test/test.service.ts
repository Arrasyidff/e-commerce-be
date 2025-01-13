import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { Category, Product, User } from '@prisma/client';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({ where: { username: {contains: 'test'} } });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        email: 'test@mail.com',
        password: await bcrypt.hash('test', 10),
        role: 'test',
      },
    });
  }

  async getUser(): Promise<User> {
    return await this.prismaService.user.findFirst({
      where: { username: 'test' },
    });
  }

  async deleteCategory() {
    await this.prismaService.category.deleteMany({ where: { name: {contains: 'test'} } });
  }

  async createCategory() {
    await this.prismaService.category.create({
      data: {
        name: 'test',
      },
    });
  }

  async getCategory(): Promise<Category> {
    return await this.prismaService.category.findUnique({
      where: { name: 'test' },
    });
  }

  async deleteProduct() {
    await this.prismaService.product.deleteMany({ where: { name: {contains: 'test'} } });
  }

  async createProduct() {
    await this.createCategory();
    const category = await this.getCategory()

    await this.prismaService.product.create({
      data: {
        name: 'test',
        description: 'test',
        price: 10.99,
        stock: 10,
        categoryId: category.id,
      },
    });
  }

  async getProduct(): Promise<Product> {
    return await this.prismaService.product.findFirst({
      where: { name: 'test' },
    });
  }
}
