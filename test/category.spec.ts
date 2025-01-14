import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Category Controller', () => {
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

  describe('POST /api/categories', () => {
    beforeEach(async () => {
      await testService.deleteCategory()
    })

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: '',
        })

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able create category', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: 'test',
        })

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.name).toBe('test');
    })

    it('should be rejected if name already exists', async () => {
      await testService.createCategory()
      
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: 'test',
        })

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })
  })

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      await testService.deleteCategory()

      await testService.createCategory()
    })

    it('should be able get categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/categories')

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBeDefined();
    })
  })
});
