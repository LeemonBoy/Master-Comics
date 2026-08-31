import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) should register a new user', () => {
    const registerDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      displayName: 'Test User',
    };

    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerDto)
      .expect(201)
      .expect((res: any) => {
        expect(res.body.user.email).toBe(registerDto.email);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
      });
  });

  it('/auth/login (POST) should login with valid credentials', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginDto)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.user.email).toBe(loginDto.email);
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('/auth/login (POST) should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' })
      .expect(401);
  });
});
