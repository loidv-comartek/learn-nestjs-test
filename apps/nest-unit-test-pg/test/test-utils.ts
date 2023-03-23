import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginInput } from '../src/modules/auth/dto/auth-login-input.dto';
import { AuthTokenOutput } from '../src/modules/auth/dto/auth-token-output.dto';
import { CreateUserInput } from '../src/modules/users/dto/user-create-input.dto';
import { UserOutput } from '../src/modules/users/dto/user-output.dto';
import { UsersService } from '../src/modules/users/users.service';
import { newDb, DataType } from 'pg-mem';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { config } from '../src/configs/database.config';

/**
 * setupDataSource
 * @returns
 */
export const setupDataSource = async () => {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    });
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () =>
      'PostgreSQL 14.2, compiled by Visual C++ build 1914, 64-bit',
  });

  const ds: DataSource = await db.adapters.createTypeormDataSource(config);
  await ds.initialize();
  await ds.synchronize();

  return ds;
};

/**
 * Seed admin user
 * @param app
 * @returns
 */
export const seedAdminUser = async (
  app: INestApplication,
): Promise<{ adminUser: UserOutput; authTokenForAdmin: AuthTokenOutput }> => {
  const defaultAdmin: CreateUserInput = {
    name: 'Default Admin User',
    username: 'default-admin',
    password: 'default-admin-password',
    isAccountDisabled: false,
    email: 'default-admin@example.com',
  };

  // Creating Admin User
  const userService = app.get(UsersService);

  const userOutput = await userService.createUser(defaultAdmin);
  const loginInput: LoginInput = {
    username: defaultAdmin.username,
    password: defaultAdmin.password,
  };

  // Logging in Admin User to get AuthToken
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginInput)
    .expect(HttpStatus.OK);

  const authTokenForAdmin: AuthTokenOutput = loginResponse.body.data;

  const adminUser: UserOutput = JSON.parse(JSON.stringify(userOutput));

  return { adminUser, authTokenForAdmin };
};
