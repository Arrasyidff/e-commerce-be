import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Cart Controller', () => {
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

  describe('POST /api/carts', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createUser()
      await testService.createProduct()
    })

    it('should be rejected if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/carts/items')
        .send({
          userId: '',
          productId: '',
          quantity: ''
        })

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if request is invalid', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .post('/api/carts/items')
        .send({
          userId: '',
          productId: '',
          quantity: ''
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able add cart item', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()

      const response = await request(app.getHttpServer())
        .post('/api/carts/items')
        .send({
          userId: user.id,
          productId: product.id,
          quantity: 2
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.userId).toBe(user.id);
    })
  })

  describe('GET /api/carts', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createCart()
      await testService.addItem()
    })

    it('should be reject if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/carts')

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able get carts', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .get('/api/carts')
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toEqual(1);
    })
  })

  describe('PATCH /api/carts', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createCart()
      await testService.addItem()
    })

    it('should be reject if token is empty', async () => {
      const product = await testService.getProduct()

      const response = await request(app.getHttpServer())
        .patch(`/api/carts/items`)
        .send({
          productId: product.id,
          quantity: 2
        })

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if request is invalid', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .patch(`/api/carts/items`)
        .send({
          productId: '',
          quantity: ''
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if cart is not found', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()

      await testService.deleteCart()
      const response = await request(app.getHttpServer())
        .patch(`/api/carts/items`)
        .send({
          productId: product.id,
          quantity: 2
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if cart item is not found', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()

      const response = await request(app.getHttpServer())
        .patch(`/api/carts/items`)
        .send({
          productId: product.id+'asc',
          quantity: 2
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able update cart item', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()

      const response = await request(app.getHttpServer())
        .patch(`/api/carts/items`)
        .send({
          productId: product.id,
          quantity: 2
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.userId).toBe(user.id);
    })
  })

  describe('DELETE /api/carts/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll()
    })

    it('should be reject if token is empty', async () => {
      const cartItem = await testService.getCartItem()

      const response = await request(app.getHttpServer())
        .delete(`/api/carts/items/${cartItem.id}`)

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if cart is not found', async () => {
      const cartItem = await testService.getCartItem()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      await testService.deleteCart()

      const response = await request(app.getHttpServer())
        .delete(`/api/carts/items/${cartItem.id}`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if cart item is not found', async () => {
      const cartItem = await testService.getCartItem()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .delete(`/api/carts/items/${cartItem.id}asc`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be be able delete cart', async () => {
      const cartItem = await testService.getCartItem()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .delete(`/api/carts/items/${cartItem.id}`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })
});
