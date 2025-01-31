import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { Cart, Category, Product, User, Wishlist } from '@prisma/client';
import * as jwt from 'jsonwebtoken'
import { OrderService } from '../src/order/order.service'

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private orderService: OrderService
  ) {}

  async generateTestToken(
    payload: Record<string, any>,
    secret: string|null = 'your-secret-key'
  ): Promise<string>
  {
    return jwt.sign(payload, secret);
  };

  async deleteAll() {
    await this.deleteWishlist()
    await this.deleteOrder()
    await this.deleteCart()
    await this.deleteProduct()
    await this.deleteCategory()
    await this.deleteUser()
  }

  /** user */
  async deleteUser() {
    await this.prismaService.user.deleteMany({ where: { email: {contains: 'test'} } });
  }

  async createUser(
    username?: string|null,
    email?: string|null,
    role?: string|null
  ) {
    await this.prismaService.user.create({
      data: {
        username: username || 'test',
        email: email || 'test@mail.com',
        password: await bcrypt.hash('test', 10),
        role: role || 'test',
      },
    });
  }

  async getUser(username?: string|null): Promise<User> {
    return await this.prismaService.user.findFirst({
      where: { username: username || 'test' },
    });
  }
  /** end user */

  /** category */
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
  /** end category */

  /** product */
  async deleteProduct() {
    await this.prismaService.product.deleteMany({ where: { name: {contains: 'test'} } });
  }

  async createProduct() {
    await this.deleteCategory()
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
  /** end product */

  /** cart */
  async createCart() {
    await this.createUser()
    await this.createProduct()

    const user = await this.getUser()

    await this.prismaService.cart.create({
      data: {userId: user.id}
    })
  }

  async getCart(): Promise<Cart> {
    const user = await this.getUser()
    return await this.prismaService.cart.findUnique({
      where: {userId: user.id}
    })
  }

  async addItem() {
    const cart = await this.getCart()
    const product = await this.getProduct()

    await this.prismaService.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: 2
      }
    })
  }

  async getCartItem() {
    await this.createCart()
    await this.addItem()

    const cart = await this.getCart()
    return await this.prismaService.cartItem.findFirst({
      where: {cartId: cart.id}
    })
  }
  
  async getCartItems() {
    await this.createCart()
    await this.addItem()

    const cart = await this.getCart()
    return await this.prismaService.cartItem.findMany({
      where: {cartId: cart.id}
    })
  }

  async deleteCartItem() {
    await this.prismaService.cartItem.deleteMany()
  }

  async deleteCart() {
    await this.prismaService.cartItem.deleteMany()
    await this.prismaService.cart.deleteMany()
  }
  /** end cart */

  /** order */
  async deleteOrder() {
    await this.prismaService.orderItem.deleteMany()
    await this.prismaService.order.deleteMany()
  }

  async createOrder() {
    await this.createCart()
    await this.addItem()
    const user = await this.getUser()

    await this.orderService.createOrder(user, {payment_method: 'transfer'})
  }

  async getOrder() {
    const user = await this.getUser()
    
    return await this.prismaService.order.findFirst({
      where: {userId: user.id}
    })
  }
  /** end order */

  /** wishlist */
  async createWishlist(userId: string) {
    await this.prismaService.wishlist.create({
      data: {userId: userId}
    })
  }

  async getWishlist(userId: string): Promise<Wishlist> {
    return await this.prismaService.wishlist.findUnique({
      where: {userId: userId}
    })
  }

  async addWishlistItem(wishlistId: string) {
    await this.createProduct()
    const product = await this.getProduct()

    await this.prismaService.wishlistItem.create({
      data: {
        wishlistId: wishlistId,
        productId: product.id
      }
    })
  }

  async deleteWishlist() {
    await this.prismaService.wishlistItem.deleteMany()
    await this.prismaService.wishlist.deleteMany()
  }
  
  /** end wishlist */
}