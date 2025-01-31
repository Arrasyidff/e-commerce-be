import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Order Controller', () => {
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

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      await testService.deleteAll()
    })

    it('should be rejected if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if request is invalid', async () => {
      await testService.createUser()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          payment_method: ''
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if request is invalid', async () => {
      await testService.createUser()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          payment_method: ''
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if cart is not found', async () => {
      await testService.createCart()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      await testService.deleteCart()
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          payment_method: 'transfer'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if cart is not found', async () => {
      await testService.createCart()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      await testService.deleteCart()
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          payment_method: 'transfer'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if cart item is not found', async () => {
      await testService.createCart()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      await testService.deleteCartItem()
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          payment_method: 'transfer'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able create order', async () => {
      await testService.createCart()
      await testService.addItem()
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          payment_method: 'transfer'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createOrder()
    })

    it('should be reject if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders`)

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able get orders', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .get(`/api/orders`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
    })

    it('should be able get orders fitler by status pending', async () => {
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const response = await request(app.getHttpServer())
        .get(`/api/orders`)
        .query({
          status: 'Pending'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
    })
  })

  describe('GET /api/orders/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createOrder()
    })

    it('should be reject if order is not found', async () => {
      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${order.id}asc`)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able get order', async () => {
      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${order.id}`)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })

  describe('PATCH /api/orders/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createOrder()
    })

    it('should be reject if token is empty', async () => {
      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}`)

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if user is not admin', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}`)
        .send({
          status: 'Confirmed'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if request is invalid', async () => {
      await testService.createUser('testAdmin', 'testAdmin@mail.com', 'admin')
      const user = await testService.getUser('testAdmin')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}`)
        .send({
          status: ''
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if order is not found', async () => {
      await testService.createUser('testAdmin', 'testAdmin@mail.com', 'admin')
      const user = await testService.getUser('testAdmin')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}asc`)
        .send({
          status: 'Confirmed'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be reject if order is not found', async () => {
      await testService.createUser('testAdmin', 'testAdmin@mail.com', 'admin')
      const user = await testService.getUser('testAdmin')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')

      const order = await testService.getOrder()
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}`)
        .send({
          status: 'Confirmed'
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })
});
