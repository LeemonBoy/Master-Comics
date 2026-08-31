import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ComicsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'comic@test.com', username: 'comictest', password: 'password123', displayName: 'Comic Test' });

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/comics (POST) should create a comic when authenticated', () => {
    return request(app.getHttpServer())
      .post('/api/comics')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Comic', description: 'A test comic', status: 'DRAFT' })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.title).toBe('Test Comic');
        expect(res.body.id).toBeDefined();
      });
  });

  it('/comics (GET) should return published comics', () => {
    return request(app.getHttpServer())
      .get('/api/comics')
      .expect(200)
      .expect((res: any) => {
        expect(res.body.comics).toBeDefined();
        expect(Array.isArray(res.body.comics)).toBe(true);
      });
  });
});
