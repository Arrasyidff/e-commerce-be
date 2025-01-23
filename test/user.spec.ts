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
      await testService.deleteAll()
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

  describe('GET /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser()

      await testService.createUser(null, null, 'admin');
    })

    it('should be rejected if token is empty', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('authorization', 'invalid');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if role not equal admin', async () => {
      await testService.createUser('test123', 'test123@mail.com')
      const user = await testService.getUser('test123')
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('authorization', token);

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able get users', async () => {
      const user = await testService.getUser()
      const token = await testService.generateTestToken({id: user.id, email: user.email}, 'secret')
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('authorization', token);

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    })
  })

  describe('GET /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser()

      await testService.createUser(null, null, 'admin');
    })

    it('should be rejected if user is not found', async () => {
      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .get(`/api/users/${user.id}asc`)

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able get user', async () => {
      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .get(`/api/users/${user.id}`)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toEqual(user.id);
      expect(response.body.data.username).toEqual(user.username);
      expect(response.body.data.email).toEqual(user.email);
      expect(response.body.data.role).toEqual(user.role);
    })
  })

  describe('PATCH /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser()

      await testService.createUser(null, null, 'admin');
    })

    it('should be rejected if user is not found', async () => {
      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}asc`)
        .send({
          username: 'test',
          email: 'test@mail.com',
          password: 'test',
          role: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if request is invalid', async () => {
      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}`)
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

    it('should be able to update user', async () => {
      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}`)
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

    it('should be rejected if email already exists', async () => {
      await testService.createUser(null, 'test123@mail.com');
      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}`)
        .send({
          username: 'test',
          email: 'test123@mail.com',
          password: 'test',
          role: 'test'
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  })

  describe('DELETE /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser()

      await testService.createUser(null, null, 'admin');
    })

    it('should be rejected if user is not admin', async () => {
      await testService.createUser('test123', 'test123@mail.com')
      const userLogin = await testService.getUser('test123')
      const token = await testService.generateTestToken({
        id: userLogin.id,
        email: userLogin.email},
        'secret'
      )

      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .set('authorization', token);

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBeDefined();
    })

    it('should be rejected if user is not found', async () => {
      await testService.createUser('test123', 'test123@mail.com', 'admin')
      const userLogin = await testService.getUser('test123')
      const token = await testService.generateTestToken({
        id: userLogin.id,
        email: userLogin.email},
        'secret'
      )

      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}asc`)
        .set('authorization', token);

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    })

    it('should be able to delete', async () => {
      await testService.createUser('test123', 'test123@mail.com', 'admin')
      const userLogin = await testService.getUser('test123')
      const token = await testService.generateTestToken({
        id: userLogin.id,
        email: userLogin.email},
        'secret'
      )

      const user = await testService.getUser()
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .set('authorization', token);

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toEqual('Ok');
    })
  })
});
