import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('User Controller', () => {
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

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser()
    })

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          email: '',
          password: '',
          role: ''
        })

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          email: 'test@mail.com',
          password: 'test',
          role: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email).toBe('test@mail.com');
      expect(response.body.data.role).toBe('test');
    });

    it('should be able to register when role is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          email: 'test@mail.com',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email).toBe('test@mail.com');
      expect(response.body.data.role).toBe('customer');
    });

    it('should be rejected if email already exists', async () => {
      await testService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          email: 'test@mail.com',
          password: 'test',
          role: 'test'
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  })

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await testService.deleteUser()
    })

    it('should be rejected if request is invalid', async () => {
      await testService.createUser()
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: '',
          password: '',
        })

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if email is not found', async () => {
      await testService.createUser()
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'test123@mail.com',
          password: 'test',
        })

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if password is not correct', async () => {
      await testService.createUser()
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'test@mail.com',
          password: 'test123',
        })

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able to login', async () => {
      await testService.createUser()
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'test@mail.com',
          password: 'test',
        })

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBeDefined();
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.email).toBe('test@mail.com');
      expect(response.body.data.role).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    })
  })
});
