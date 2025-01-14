import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as jwt from 'jsonwebtoken'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async use(req: any, res: any, next: (error?: Error | any) => void) {
    const token = req.headers['authorization'] as string;
    try {
      const decoded = await jwt.verify(token, 'secret') as Record<string, any>;
      if (token) {
        const user = await this.prismaService.user.findFirst({
          where: { id: decoded.id },
        });
        if (user) {
          req.user = user;
        }
      }
    } catch (error) {
      this.logger.error(`Failed token verification ${JSON.stringify(error)}`)
    }

    next();
  }
}
