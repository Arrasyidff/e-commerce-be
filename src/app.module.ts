import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    CategoryModule,
    ProductModule
  ],
})
export class AppModule {}
