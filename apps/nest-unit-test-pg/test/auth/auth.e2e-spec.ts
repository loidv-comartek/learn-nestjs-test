import { VALIDATION_PIPE_OPTIONS } from '@app/common';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../nest-unit-test-pg/src/modules/users/users.service';
import { AuthService } from '../../../nest-unit-test-pg/src/modules/auth/auth.service';

import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupDataSource } from '../test-utils';
import { AuthTokenOutput } from 'apps/nest-unit-test-pg/src/modules/auth/dto/auth-token-output.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupDataSource();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
    app.enableCors();
    await app.init();
  });

  it('should be defined', async () => {
    // test database in pg-mem
    // create user and login

    expect(app).toBeDefined();
  });

  describe('register', () => {
    const user = {
      username: 'dung2123',
      name: '1234567',
      password: '123412331',
      email: '123@gmail.com',
    };
    it('should response status code 400 when username is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          username: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when username is not string', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          username: 123123123,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when username is have length less than 6', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          username: '12345',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when username is have length better than 100', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          username: (() => {
            let username = '';
            for (let i = 0; i <= 100; i++) {
              username += i;
            }
            return username;
          })(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    //
    it('should response status code 400 when password is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          password: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when password is not string', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          password: 123123123,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when password is have length less than 6', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          password: '12345',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when password is have length better than 100', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          password: (() => {
            let pass = '';
            for (let i = 0; i <= 100; i++) {
              pass += i;
            }
            return pass;
          })(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    //
    it('should response status code 400 when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          name: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when name is not string', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          name: 123123,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when name is have length less than 3', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          name: 'ac',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when name is have length better than 100', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          name: (() => {
            let name = '';
            for (let i = 0; i <= 100; i++) {
              name += i;
            }
            return name;
          })(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    //
    it('should response status code 400 when email is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          email: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when email is not email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          email: '123123123',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when emnail is have length greater than 100', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          email: `${(() => {
            let name = '';
            for (let i = 0; i <= 100; i++) {
              name += i;
            }
            return name;
          })()}@gmail.com`,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 401 when username is exitsing', async () => {
      const userService = app.get(UsersService);
      const userUnique = {
        username: 'dungzzz1234',
        email: 'dungzzzzdsa@gmail.com',
      };
      await userService.createUser({
        ...user,
        ...userUnique,
        isAccountDisabled: false,
      });
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          ...userUnique,
          email: 'dungakaka@gmail.com',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should response status code 401 when email is exitsing', async () => {
      const userService = app.get(UsersService);
      const userUnique = {
        username: 'dungzzz12345',
        email: 'dungzzzzds55a@gmail.com',
      };
      await userService.createUser({
        ...user,
        ...userUnique,
        isAccountDisabled: false,
      });
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          ...userUnique,
          username: 'asdasdasda1',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should response status code 401 when email and username is exitsing', async () => {
      const userService = app.get(UsersService);
      const userUnique = {
        username: 'dungzzz123451',
        email: 'dungzzzzds551a@gmail.com',
      };
      await userService.createUser({
        ...user,
        ...userUnique,
        isAccountDisabled: false,
      });
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          ...userUnique,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should response status code 201 and user when email and username is not exitsing', async () => {
      const userUnique = {
        username: 'dungz12345cc',
        email: 'dungs551aas@gmail.com',
      };
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...user,
          ...userUnique,
        })
        .expect(HttpStatus.CREATED);
      expect(body.data.username).toBe(userUnique.username);
      expect(body.data.email).toBe(userUnique.email);
      expect(body.data.name).toBe(user.name);
    });
  });

  describe('login', () => {
    const loginInfo = {
      username: 'dungdepzainhathegioi@gmail.com',
      password: 'dungdz123',
    };
    let userService: UsersService;
    let authService: AuthService;
    beforeAll(() => {
      userService = app.get(UsersService);
      authService = app.get(AuthService);
    });
    it('should response status code 400 when username is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          username: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when username is not string', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          username: 123123123,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when username is have length better than 200', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          username: (() => {
            let username = '';
            for (let i = 0; i <= 200; i++) {
              username += i;
            }
            return username;
          })(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 400 when password is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          password: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should response status code 401 when password had gone wrong', async () => {
      await userService.createUser({
        ...loginInfo,
        username: 'dungkaka',
        name: 'dunghello',
        email: 'dungvippro@gmail.com',
        isAccountDisabled: false,
      });
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          username: 'dungkaka',
          password: 'saimatkhauroi',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should response status code 401 when username had gone wrong', async () => {
      await userService.createUser({
        ...loginInfo,
        username: 'dung12313',
        name: 'dunghello',
        email: 'dungvippro1@gmail.com',
        isAccountDisabled: false,
      });
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          username: 'saitaikhoanroi',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should response status code 200 and tokens when loginInfo correct', async () => {
      const user = await userService.createUser({
        ...loginInfo,
        name: 'dunghello',
        email: 'dungvippro10@gmail.com',
        isAccountDisabled: false,
      });
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
        })
        .expect(HttpStatus.OK);
      const tokens = authService.getAuthToken(user);
      expect(body.data).toMatchObject(tokens);
    });
  });

  describe('recovery', () => {
    const email = 'dung@gmail.com';
    it('should return status 400 when email is emtpty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/recovery')
        .send({
          email: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return status 400 when email is not email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/recovery')
        .send({
          email: '123',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return status 200 and data when email is valid ', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/auth/recovery')
        .send({
          email: email,
        })
        .expect(HttpStatus.OK);
      expect(body.data).toMatchObject({
        isSuccess: true,
        direct_url: `http://localhost:3000/api/v1/auth/login`,
        message:
          'Recovery request successfully, please check your email to recovering your account!',
      });
    });
  });

  describe('reset', () => {
    const passwordUpdateInputDto = {
      password: '123456789',
    };
    const loginInfo = {
      username: 'dung21022001',
      password: 'dung123456',
    };
    let tokens: AuthTokenOutput;
    let authService: AuthService;
    let userService: UsersService;
    beforeAll(async () => {
      authService = app.get(AuthService);
      userService = app.get(UsersService);
      await userService.createUser({
        username: 'dung21022001',
        password: 'dung123456',
        name: 'dunghello',
        email: 'dungvippro123@gmail.com',
        isAccountDisabled: false,
      });

      const { body } = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginInfo)
        .expect(HttpStatus.OK);
      tokens = body.data;
    });
    it('should return status 401 when authorization is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .send({
          password: '1231231231',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return status 401 when token authorization gone wrong', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .set('Authorization', 'Bearer ' + tokens.accessToken + '1')
        .send({
          password: passwordUpdateInputDto,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return status 400 when password is emtpty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({
          password: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return status 400 when password is not string', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({
          password: 123,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return status 400 when password is less than 6', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({
          password: '12345',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return status 400 when password is greater than 100', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({
          password: (() => {
            let pass = '';
            for (let i = 0; i <= 100; i++) {
              pass += i;
            }
            return pass;
          })(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return status 200 and logging success when password is valid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send(passwordUpdateInputDto)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          ...loginInfo,
          ...passwordUpdateInputDto,
        })
        .expect(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
