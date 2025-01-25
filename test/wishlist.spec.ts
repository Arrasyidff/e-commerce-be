import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Wishlist Controller', () => {
  let app: INestApplication;
  let logger: Logger
  let testService: TestService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER)
    testService = app.get(TestService)
  });

  describe('POST /api/wishlists', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createUser()
      await testService.createProduct()
    })

    it('should be rejected if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/wishlists')
        .send({
          productId: '',
        })

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if invalid request', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .post('/api/wishlists')
        .send({
          productId: '',
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if product is not found', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .post('/api/wishlists')
        .send({
          productId: `${product.id}+asc`,
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if wishlist item already exists', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      await testService.deleteProduct()
      
      await testService.createWishlist(user.id)
      const wishlist = await testService.getWishlist(user.id)
      await testService.addWishlistItem(wishlist.id)
      
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .post('/api/wishlists')
        .send({
          productId: product.id,
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able create wishlist', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .post('/api/wishlists')
        .send({
          productId: product.id,
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })

  describe('GET /api/wishlists', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createUser()
      const user = await testService.getUser()

      await testService.createWishlist(user.id)
      const wishlist = await testService.getWishlist(user.id)
      await testService.addWishlistItem(wishlist.id)
    })

    it('should be reject if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/wishlists')

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able get wishlist', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .get('/api/wishlists')
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
    })

    it('should be able get wishlist', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .get('/api/wishlists')
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
    })

    it('should be able get wishlist when user doesnt have wishlist', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      await testService.deleteWishlist()
      const response = await request(app.getHttpServer())
        .get('/api/wishlists')
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
    })
  })

  describe('DELETE /api/wishlists', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createUser()
      const user = await testService.getUser()

      await testService.createWishlist(user.id)
      const wishlist = await testService.getWishlist(user.id)
      await testService.addWishlistItem(wishlist.id)
    })

    it('should be reject if token is empty', async () => {
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .delete(`/api/wishlists/${product.id}`)

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if wishlist is not found', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      await testService.deleteWishlist()
      const response = await request(app.getHttpServer())
        .delete(`/api/wishlists/${product.id}`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if product is not found', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .delete(`/api/wishlists/${product.id}asc`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able delete wishlist', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .delete(`/api/wishlists/${product.id}`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })
});
