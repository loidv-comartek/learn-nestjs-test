import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { seedAdminUser, setupDataSource } from '../test-utils';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupDataSource();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should be defined', async () => {
    // test database in pg-mem
    // create user and login
    const { adminUser, authTokenForAdmin } = await seedAdminUser(app);

    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
