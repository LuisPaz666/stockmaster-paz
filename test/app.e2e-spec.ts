import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/modules/app.module';

describe('StockMaster (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/api/v1/auth/profile (GET) should return 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/profile').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
