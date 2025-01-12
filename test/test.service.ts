import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

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
}
