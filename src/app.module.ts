import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    WishlistModule
  ],
})
export class AppModule {}
