import { EnvService } from '@app/common/env/env.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/auth-register-input.dto';
import { RegisterOutput } from './dto/auth-register-output.dto';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
} from '@app/common/dtos/base-api-response.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthTokenOutput } from './dto/auth-token-output.dto';
import { RecoveryAccountOrderOutput } from './dto/auth-recovery-output.dto';
import { UserInRequest } from './types/user-in-request.type';

const mockedAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  recoveryAccountOrder: jest.fn(),
  resetPassword: jest.fn(),
  getAuthToken: jest.fn(),
};

const mockedEnvService = {
  get: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockedAuthService },
        {
          provide: EnvService,
          useValue: mockedEnvService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register controller', () => {
    const registerInput: RegisterInput = {
      name: 'dung',
      username: 'dung1234',
      password: '123456789',
      email: 'dung@gmail.com',
    };
    const { password, ...rest } = registerInput;
    const userCreated: RegisterOutput = {
      ...rest,
      isAccountDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 12345,
    };
    beforeEach(() => jest.clearAllMocks());
    it('should return userdata when register input valid', async () => {
      mockedAuthService.register = jest.fn(async () => userCreated);
      await expect(
        controller.registerLocal(registerInput),
      ).resolves.toMatchObject<BaseApiResponse<RegisterOutput>>({
        data: userCreated,
        meta: {},
      });
    });

    it('should throw Unauthorization Error with statusCode 401 when register input valid', async () => {
      mockedAuthService.register = jest.fn(async () => {
        throw new UnauthorizedException();
      });
      await expect(
        controller.registerLocal(registerInput),
      ).rejects.toThrowError(new UnauthorizedException());
    });
  });

  describe('logging controller', () => {
    const login = {
      username: 'dung',
      password: '123456789',
    };
    const tokens: AuthTokenOutput = {
      accessToken: '1234',
      refreshToken: '12345',
    };
    beforeEach(() => jest.clearAllMocks());
    it('should response AuthToken when login data is valid', async () => {
      mockedAuthService.login = jest.fn(async () => tokens);
      await expect(controller.login(login)).resolves.toMatchObject<
        BaseApiResponse<AuthTokenOutput>
      >({
        data: tokens,
        meta: {},
      });
    });

    it('should throw UnauthorizedException when login data is invalid ', async () => {
      mockedAuthService.login = jest.fn(async () => {
        throw new UnauthorizedException();
      });
      await expect(controller.login(login)).rejects.toThrowError(
        new UnauthorizedException(),
      );
    });
  });

  describe('recovery controller', () => {
    const email = 'wuetoix3333@gmail.com';
    beforeEach(() => jest.clearAllMocks());
    it('should be recovery account order response', async () => {
      mockedAuthService.recoveryAccountOrder = jest.fn(async () => true);
      mockedEnvService.get = jest.fn((key: 'API_HOST_URL') => {
        return 'http://localhost:3000';
      });
      await expect(controller.recovery({ email })).resolves.toMatchObject<
        BaseApiResponse<RecoveryAccountOrderOutput>
      >({
        data: {
          isSuccess: true,
          direct_url: 'http://localhost:3000/api/v1/auth/login',
          message:
            'Recovery request successfully, please check your email to recovering your account!',
        },
        meta: {},
      });
    });
  });

  describe('rest password controller', () => {
    const me: UserInRequest = {
      userId: 123,
      username: 'dung',
    };
    const passwordUpdateInput = '123456';
    const tokens = {
      refreshToken: '123456',
      accessToken: 'abcd',
    };
    beforeEach(() => jest.clearAllMocks());
    it('should throw UnauthorizedException() when user not found', async () => {
      mockedAuthService.resetPassword = jest.fn(async () => {
        throw new UnauthorizedException();
      });
      await expect(
        controller.reset({ password: passwordUpdateInput }, me),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should response AuthTokenOutPut when user reset password valid', async () => {
      mockedAuthService.resetPassword = jest.fn(async () => ({
        id: 123,
        name: 'dung',
        username: 'dungbui',
        email: 'dung@gmail.com',
        isAccountDisable: false,
        createdAt: Date(),
        updatedAt: Date(),
      }));
      mockedAuthService.getAuthToken = jest.fn(() => tokens);
      await expect(
        controller.reset({ password: passwordUpdateInput }, me),
      ).resolves.toMatchObject<BaseApiResponse<AuthTokenOutput>>({
        data: tokens,
        meta: {},
      });
    });
  });
});
