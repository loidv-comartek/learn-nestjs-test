import { EnvService } from '@app/common/env/env.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockedRepository = {
    save: jest.fn(),
    findOne: jest.fn(() => {
      return {
        username: 'John',
        password: 'Admin@123',
        email: 'john@gmail.com',
        isAccountDisabled: false,
      };
    }),
    findAndCount: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(() => {
      return {
        generatedMaps: [],
        raw: [],
        affected: 1,
      };
    }),
  };

  const mockedEnvService = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockedRepository,
        },
        {
          provide: EnvService,
          useValue: mockedEnvService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be create a new user', async () => {
    const user = await service.createUser({
      name: 'John Doe',
      username: 'john',
      password: 'Admin@123',
      email: 'john@gmail.com',
      isAccountDisabled: false,
    });

    expect(user.username).toBeDefined();
  });

  it('should be return a user', async () => {
    const result = await service.findOne({ username: 'John' });
    expect(result.username).toEqual('John');
  });

  it('should be return result update', async () => {
    const result = await service.update({
      id: 1,
      name: 'John',
    });
    expect(result).toMatchObject({
      generatedMaps: [],
      raw: [],
      affected: 1,
    });
  });
});
