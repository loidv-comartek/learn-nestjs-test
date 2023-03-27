import { EnvService } from '@app/common/env/env.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindOneOptions, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
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
    find: jest.fn(() => {
      return [
        {
          username: 'John',
          password: 'Admin@123',
          email: 'john@gmail.com',
          isAccountDisabled: false,
        },
        {
          username: 'John1',
          password: 'JohnDoe@123',
          email: 'JohnDoe@gmail.com',
          isAccountDisabled: false,
        },
      ];
    }),

    exist: jest.fn((options: FindOneOptions<User>) => {
      const email = (options.where as FindOptionsWhere<User>).email;

      if (email == 'john@gmail.com') {
        return true;
      } else {
        return false;
      }
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

  describe('create user', () => {
    it('should be create a new user', async () => {
      service.isExistEmail = jest.fn(async (email) => {
        if (email == 'johndoe@gmail.com') return true;
        return false;
      });

      const user = await service.createUser({
        name: 'John Doe',
        username: 'john',
        password: 'Admin@123',
        email: 'johndoe@gmail.com',
        isAccountDisabled: false,
      });

      expect(user.username).toBeDefined();
    });

    it('should be return error email is exist in system', async () => {
      //mock check exist email
      service.isExistEmail = jest.fn(async (email) => {
        if (email == 'john@gmail.com') return true;
        return false;
      });

      try {
        const user = await service.createUser({
          name: 'John Doe',
          username: 'john',
          password: 'Admin@123',
          email: 'john@gmail.com',
          isAccountDisabled: false,
        });
        expect(user.username).toBeDefined();
      } catch (error) {
        expect(error).toThrow();
      }
    });
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

  it('should be return a user array', async () => {
    const result = await service.find({ username: 'admin' });
    expect(result).toMatchObject([
      {
        username: 'John',
        password: 'Admin@123',
        email: 'john@gmail.com',
        isAccountDisabled: false,
      },
      {
        username: 'John1',
        password: 'JohnDoe@123',
        email: 'JohnDoe@gmail.com',
        isAccountDisabled: false,
      },
    ]);
  });

  describe('it is valid email', () => {
    it('should return true if email input is valid', async () => {
      const email = 'john@gmail.com';
      const result = await service.isExistEmail(email);
      expect(result).toBeTruthy();
    });

    it('should return false if email input is invalid', async () => {
      const email = 'janedoe@gmail.com';
      const result = await service.isExistEmail(email);
      expect(result).toBeFalsy();
    });
  });
});
