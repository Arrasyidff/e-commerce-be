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
      await testService.deleteAll()

      await testService.createCategory()
      await testService.createUser(null, null, 'admin')
    })

    it('should be rejected if token is empty', async () => {
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

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if user is not admin', async () => {
      await testService.createUser('test123', 'test123@mail.com')
      const user = await testService.getUser('test123')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: '',
          description: '',
          price: '0',
          stock: 0,
          categoryId: '',
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if request is invalid', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: '',
          description: '',
          price: '0',
          stock: 0,
          categoryId: '',
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if category is not found', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'test',
          description: 'test',
          price: '12.122',
          stock: 1,
          categoryId: 'test',
        })
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able create product', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
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
        .set('authorization', token)

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

  describe('GET /api/products', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createProduct()
    })

    it('should be able get products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBeDefined();
      expect(response.body.data[0].description).toBeDefined();
      expect(response.body.data[0].price).toBeDefined();
      expect(response.body.data[0].stock).toBeDefined();
      expect(response.body.data[0].categoryId).toBeDefined();
    })

    it('should be able get products filter by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?name=test')

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBeDefined();
      expect(response.body.data[0].description).toBeDefined();
      expect(response.body.data[0].price).toBeDefined();
      expect(response.body.data[0].stock).toBeDefined();
      expect(response.body.data[0].categoryId).toBeDefined();
    })

    it('should be able get products filter by price', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?price=10.99')

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBeDefined();
      expect(response.body.data[0].description).toBeDefined();
      expect(response.body.data[0].price).toBeDefined();
      expect(response.body.data[0].stock).toBeDefined();
      expect(response.body.data[0].categoryId).toBeDefined();
    })
  })

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createProduct()
    })

    it('should be rejected if product is not found', async () => {
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .get('/api/products/'+(product.id+'asc'))

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be get product', async () => {
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .get('/api/products/'+product.id)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.description).toBeDefined();
      expect(response.body.data.price).toBeDefined();
      expect(response.body.data.stock).toBeDefined();
      expect(response.body.data.categoryId).toBeDefined();
    })
  })

  describe('PATCH /api/products/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createProduct()
    })

    it('should be rejected if token is empty', async () => {
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .patch('/api/products/'+(product.id))
        .send({
          name: '',
          description: '',
          price: '',
          stock: 0,
          categoryId: '',
        })

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if user is not admin', async () => {
      await testService.createUser('test', 'test@mail.com')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .patch('/api/products/'+(product.id))
        .set('authorization', token)
        .send({
          name: 'test',
          description: 'test',
          price: '12.122',
          stock: 1,
          categoryId: 'test',
        })

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if request is invalid', async () => {
      await testService.createUser('test', 'test@mail.com')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .patch('/api/products/'+(product.id))
        .set('authorization', token)
        .send({
          name: '',
          description: '',
          price: '',
          stock: 0,
          categoryId: '',
        })

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if product is not found', async () => {
      await testService.createUser('test', 'test@mail.com', 'admin')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const category = await testService.getCategory()
      const response = await request(app.getHttpServer())
        .patch(`/api/products/${product.id}asc`)
        .set('authorization', token)
        .send({
          name: 'test',
          description: 'test',
          price: '12.122',
          stock: 1,
          categoryId: category.id,
        })

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if category is not found', async () => {
      await testService.createUser('test', 'test@mail.com', 'admin')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .patch('/api/products/'+(product.id))
        .set('authorization', token)
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

    it('should be able update product', async () => {
      await testService.createUser('test', 'test@mail.com', 'admin')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const category = await testService.getCategory()
      const response = await request(app.getHttpServer())
        .patch('/api/products/'+(product.id))
        .set('authorization', token)
        .send({
          name: 'test',
          description: 'test',
          price: '12.122',
          stock: 2,
          categoryId: category.id,
        })

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(product.id);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.description).toBe('test');
      expect(response.body.data.price).toBe('12.12');
      expect(response.body.data.stock).toBe(2);
      expect(response.body.data.categoryId).toBe(category.id);
    })
  })

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll()

      await testService.createProduct()
    })

    it('should be rejected if token is empty', async () => {
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .delete('/api/products/'+(product.id))

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if user is not admin', async () => {
      await testService.createUser('test', 'test@mail.com')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .delete('/api/products/'+(product.id))
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if product is not found', async () => {
      await testService.createUser('test', 'test@mail.com', 'admin')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .patch(`/api/products/${product.id}asc`)
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able update product', async () => {
      await testService.createUser('test', 'test@mail.com', 'admin')
      const user = await testService.getUser('test')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const product = await testService.getProduct()
      const response = await request(app.getHttpServer())
        .delete('/api/products/'+(product.id))
        .set('authorization', token)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBe('Ok');
    })
  })
});
