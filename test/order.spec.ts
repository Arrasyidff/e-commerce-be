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
});
