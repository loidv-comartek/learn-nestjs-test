import { EnvService } from '@app/common/env/env.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { setupDataSource } from '../../../test/test-utils';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { DataSource } from 'typeorm';
import { RegisterInput } from './dto/auth-register-input.dto';
import { compare, hash } from 'bcrypt';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { plainToClass } from 'class-transformer';
import { RegisterOutput } from './dto/auth-register-output.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: UserRepository;
  let userService: UsersService;
  let envService: EnvService;
  let dataSource: DataSource;
  beforeAll(async () => {
    dataSource = await setupDataSource();
    envService = new EnvService(new ConfigService());
    jwtService = new JwtService();
    userRepository = new UserRepository(dataSource);
    userService = new UsersService(userRepository, envService);
    service = new AuthService(
      userRepository,
      jwtService,
      userService,
      envService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userService).toBeDefined();
    expect(envService).toBeDefined();
  });

  describe('validateUser function', () => {
    beforeEach(() => jest.clearAllMocks());
    const user = {
      name: 'dung',
      password: '123456789',
    };

    it('should throw UnauthorizedException() when validate gone wrong', async () => {
      const spyValidateUsernamePassword = jest.spyOn(
        userService,
        'validateUsernamePassword',
      );
      spyValidateUsernamePassword.mockImplementation(async () => {
        throw new UnauthorizedException();
      });
      await expect(
        service.validateUser(user.name, user.password),
      ).rejects.toThrowError(new UnauthorizedException());
      expect(spyValidateUsernamePassword).toHaveBeenCalled();
      spyValidateUsernamePassword.mockReset();
    });

    it('should throw UnauthorizedException(This user account has been disabled) when validateUser with user is disabled', async () => {
      const spyValidateUsernamePassword = jest.spyOn(
        userService,
        'validateUsernamePassword',
      );
      spyValidateUsernamePassword.mockImplementation(async () => {
        return {
          id: 12345,
          name: 'dung',
          username: 'dungdz',
          email: 'dungdz@gmail.com',
          isAccountDisabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      await expect(
        service.validateUser(user.name, user.password),
      ).rejects.toThrowError(
        new UnauthorizedException('This user account has been disabled'),
      );
      expect(spyValidateUsernamePassword).toHaveBeenCalled();
      spyValidateUsernamePassword.mockReset();
    });

    it('should return User when validateUser with user is able', async () => {
      const userValidatedMock = {
        id: 12345,
        name: 'dung',
        username: 'dungdz',
        email: 'dungdz@gmail.com',
        isAccountDisabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const spyValidateUsernamePassword = jest.spyOn(
        userService,
        'validateUsernamePassword',
      );
      spyValidateUsernamePassword.mockImplementation(
        async () => userValidatedMock,
      );
      await expect(
        service.validateUser(user.name, user.password),
      ).resolves.toMatchObject(userValidatedMock);
    });
  });

  describe('login function', () => {
    const loginDto = {
      username: '123456789',
      password: '123456789',
    };
    const mockUserValidated = {
      id: 1,
      ...loginDto,
    };
    beforeEach(() => jest.clearAllMocks());
    it('should throw UnauthorizedException() when logging with validateUser func gone wrong', async () => {
      const spyValidateUser = jest.spyOn(service, 'validateUser');
      spyValidateUser.mockRejectedValueOnce(new UnauthorizedException());
      await expect(service.login(loginDto)).rejects.toThrowError(
        new UnauthorizedException(),
      );
      expect(spyValidateUser).toHaveBeenCalled();
      spyValidateUser.mockRestore();
    });

    it('should throw error when longging with getToken is error ', async () => {
      const spyValidateUser = jest.spyOn(service, 'validateUser');
      const spyGetAuthToken = jest.spyOn(service, 'getAuthToken');
      spyValidateUser.mockResolvedValueOnce(mockUserValidated);
      spyGetAuthToken.mockImplementation(() => {
        throw new Error();
      });
      await expect(service.login(loginDto)).rejects.toThrowError(new Error());
      expect(spyValidateUser).toHaveBeenCalled();
      expect(spyGetAuthToken).toHaveBeenCalled();
      spyValidateUser.mockRestore();
      spyGetAuthToken.mockRestore();
    });

    it('should return token when logging with validateUser and getToken is not error ', async () => {
      const userLoggingData = {
        username: '123456789',
        password: '123456789',
      };
      const mockUserValidated = {
        id: 1,
        ...userLoggingData,
      };
      const mockToken = {
        accessToken: '123456',
        refreshToken: '1234567',
      };
      const spyValidateUser = jest.spyOn(service, 'validateUser');
      const spyGetAuthToken = jest.spyOn(service, 'getAuthToken');
      spyValidateUser.mockResolvedValueOnce(mockUserValidated);
      spyGetAuthToken.mockReturnValueOnce(mockToken);
      await expect(service.login(userLoggingData)).resolves.toMatchObject(
        mockToken,
      );
      expect(spyValidateUser).toHaveBeenCalled();
      expect(spyGetAuthToken).toHaveBeenCalled();
      spyValidateUser.mockRestore();
      spyGetAuthToken.mockRestore();
    });
  });

  describe('recovery account order ', () => {
    const recoveryDto = { email: 'dung1234@gmail.com' };
    const user = {
      id: 12345,
      name: 'dung',
      username: 'dungdz',
      email: 'dungdz@gmail.com',
      password: 'aasdas',
      isAccountDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    beforeEach(() => jest.clearAllMocks());

    it('should return true and send email when email is exist ', async () => {
      const spyFindUserByEmail = jest.spyOn(userRepository, 'findByEmail');
      spyFindUserByEmail.mockImplementation(async () => user);
      const spySendingEmail = jest.spyOn(service, 'sendingEmail');
      await expect(
        service.recoveryAccountOrder(recoveryDto.email),
      ).resolves.toBe(true);
      expect(spyFindUserByEmail).toHaveBeenCalled();
      expect(spySendingEmail).toHaveBeenCalled();
      spySendingEmail.mockReset();
      spyFindUserByEmail.mockReset();
    });

    it('should return true and send email when email is not exist', async () => {
      const spyFindUserByEmail = jest.spyOn(userRepository, 'findByEmail');
      spyFindUserByEmail.mockImplementation(async () => {
        throw new NotFoundException();
      });
      const spySendingEmail = jest.spyOn(service, 'sendingEmail');
      await expect(
        service.recoveryAccountOrder(recoveryDto.email),
      ).resolves.toBe(true);
      expect(spyFindUserByEmail).toHaveBeenCalled();
      expect(spySendingEmail).toHaveBeenCalledTimes(0);
      spySendingEmail.mockReset();
      spyFindUserByEmail.mockReset();
    });
  });

  describe('get auth token function', () => {
    const user = {
      id: 123,
      username: 'dungdz',
      password: '12345678',
    };
    const subject = { sub: user.id };
    const payload: JwtPayloadInterface = {
      username: user.username,
      sub: user.id,
    };
    beforeEach(() => jest.clearAllMocks());
    it('should return exactly auth token output', () => {
      const authToken = {
        refreshToken: jwtService.sign(subject, {
          expiresIn: `${envService.get('JWT_REFRESH_TOKEN_EXP_IN_SEC')}s`,
          secret: envService.get('JWT_TOKEN_REFRESH_KEY'),
        }),
        accessToken: jwtService.sign(
          { ...payload, ...subject },
          {
            expiresIn: `${envService.get('JWT_ACCESS_TOKEN_EXP_IN_SEC')}s`,
            secret: envService.get('JWT_TOKEN_ACCESS_KEY'),
          },
        ),
      };
      expect(service.getAuthToken(user)).toMatchObject(authToken);
    });
  });

  describe('register function', () => {
    const registerInputDto: RegisterInput = {
      name: 'dungdzvkl',
      username: 'dung12345',
      password: '123456789',
      email: 'dung11@gmail.com',
      isAccountDisabled: false,
    };
    const userData = {
      ...JSON.parse(JSON.stringify(registerInputDto)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      await userRepository.delete({});
    });
    it('should throw new UnauthorizationExecption when register with email is existing', async () => {
      await userService.createUser(userData);
      await expect(
        service.register({
          ...registerInputDto,
          username: 'dung123456',
        }),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should throw new UnauthorizationExecption when register with username is existing', async () => {
      await userService.createUser(userData);
      await expect(
        service.register({
          ...registerInputDto,
          email: 'dung111@gmail.com',
        }),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should throw new UnauthorizationExecption when register with username and email is existing', async () => {
      await userService.createUser(userData);
      await expect(
        service.register({
          ...registerInputDto,
        }),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should return created user when register with username or email is not existing', async () => {
      const userCreated = {
        ...userData,
        id: 1234,
      };
      const spyCreateUser = jest.spyOn(userService, 'createUser');
      spyCreateUser.mockImplementation(async () => {
        return userCreated;
      });
      delete userCreated.password;
      await expect(service.register(registerInputDto)).resolves.toMatchObject(
        userCreated,
      );
      expect(spyCreateUser).toHaveBeenCalled();
      spyCreateUser.mockReset();
    });
  });

  describe('reset password function', () => {
    const me = {
      userId: 12345,
      username: 'dungdz',
    };
    const userInDb = {
      id: 12345,
      name: 'dung',
      username: 'dungdz',
      email: 'dungdz@gmail.com',
      password: 'aasdas',
      isAccountDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatePasswordInput = '123456789';
    beforeEach(() => jest.clearAllMocks());
    it('should Throw new UnauthorizedException() when register with user not found', async () => {
      const spyGetById = jest.spyOn(userRepository, 'getById');
      spyGetById.mockImplementation(async () => {
        throw new BadRequestException();
      });
      await expect(
        service.resetPassword(me, updatePasswordInput),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should return user when register with valid user', async () => {
      const passwordHashedAfterUpdate = await hash(updatePasswordInput, 10);
      const spyGetUserById = jest.spyOn(userRepository, 'getById');
      spyGetUserById.mockImplementation(async () => {
        return userInDb;
      });
      const spyCreateUser = jest.spyOn(userService, 'createUser');
      spyGetUserById.mockImplementation(async () => {
        return userInDb;
      });
      spyCreateUser.mockImplementation(async () => {
        return {
          ...userInDb,
          password: passwordHashedAfterUpdate,
        };
      });
      await expect(
        service.resetPassword(me, updatePasswordInput),
      ).resolves.toMatchObject({
        ...userInDb,
        password: passwordHashedAfterUpdate,
      });
      expect(spyGetUserById).toHaveBeenCalled();
      expect(spyCreateUser).toHaveBeenCalled();
      spyCreateUser.mockReset();
      spyGetUserById.mockReset();
    });
  });
});
