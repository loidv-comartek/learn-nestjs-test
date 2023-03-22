import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
// import { setupDataSource } from '@app/test-utils';
import { DataType, newDb } from 'pg-mem';
import { User } from '../../src/modules/users/entities/user.entity';
import { seedAdminUser } from '../test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const db = newDb();
    // Register current_database function
    db.public.registerFunction({
      name: 'current_database',
      args: [],
      returns: DataType.text,
      implementation: (x) => `hello world ${x}`,
    });

    // Get PG in memory DB connection
    const connection = await db.adapters.createTypeormConnection({
      type: 'postgres',
    });

    // create schema
    await connection.synchronize();

    console.log('connection', connection);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DATABASE_CONNECTION')
      .useValue(connection)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should be defined', async () => {
    await seedAdminUser(app);
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
