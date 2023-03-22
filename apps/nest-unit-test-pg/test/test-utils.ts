import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginInput } from '../src/modules/auth/dto/auth-login-input.dto';
import { AuthTokenOutput } from '../src/modules/auth/dto/auth-token-output.dto';
import { CreateUserInput } from '../src/modules/users/dto/user-create-input.dto';
import { UserOutput } from '../src/modules/users/dto/user-output.dto';
import { UsersService } from '../src/modules/users/users.service';

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
