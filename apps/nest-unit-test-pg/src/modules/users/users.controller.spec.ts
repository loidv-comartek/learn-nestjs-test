import { EnvService } from '@app/common/env/env.service';
import { Test, TestingModule } from '@nestjs/testing';
import { FindOneOptions, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
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
      controllers: [UsersController],
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be controller defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be controller defined', () => {
    expect(service).toBeDefined();
  });

  describe('find user by id', () => {
    it('should return an array of items', async () => {
      const result: User = {
        id: 1,
        name: 'John Doe',
        username: 'john',
        password: 'Admin@123',
        email: 'john@gmail.com',
        isAccountDisabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findOne').mockImplementation(async () => result);
      expect(await controller.user(1)).toBe(result);
    });
  });

  describe('find users', () => {
    it('should be return an user array', async () => {
      const shouldBeResult = [
        {
          id: 1,
          name: 'John Doe',
          username: 'john',
          password: 'Admin@123',
          email: 'john@gmail.com',
          isAccountDisabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'John Anna',
          username: 'anna',
          password: 'Admin@123',
          email: 'anna@gmail.com',
          isAccountDisabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(service, 'find')
        .mockImplementation(async () => shouldBeResult);

      expect(await controller.users()).toEqual(shouldBeResult);
    });
  });
});
