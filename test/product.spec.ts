import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Product Controller', () => {
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

  describe('POST /api/products', () => {
    beforeEach(async () => {
      await testService.deleteCategory()
      await testService.deleteProduct()

      await testService.createCategory()
    })

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: '',
          description: '',
          price: '0',
          stock: 0,
          categoryId: '',
        })

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if category is not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'test',
          description: 'test',
          price: '12.122',
          stock: 1,
          categoryId: 'test',
        })

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able create product', async () => {
      const category = await testService.getCategory()

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'test',
          description: 'test',
          price: '12.122',
          stock: 1,
          categoryId: category.id,
        })

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.description).toBe('test');
      expect(response.body.data.price).toBe('12.12');
      expect(response.body.data.stock).toBe(1);
      expect(response.body.data.categoryId).toBe(category.id);
    })
  })
});
