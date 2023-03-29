import { EnvService } from '@app/common/env/env.service';
import { Test,  } from '@nestjs/testing';
import { DataSource,  } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';
import { setupDataSource } from '../../../test/test-utils';
import {
  UnauthorizedException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let dataSource: DataSource;
  const mockedEnvService = { get: jest.fn() };

  beforeAll(async () => {
    // dataSource = await setupDataSource();

    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: new UserRepository(await setupDataSource()),
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
    it('should be return false when email is exist in system opposite return true', async () => {
      expect(await service.isExistEmail('johndoe@gmail.com')).toBeFalsy();
    });

    it('should return a user', async () => {
      const isExistEmailSpy = jest.spyOn(service, 'isExistEmail');
      isExistEmailSpy.mockImplementation(async () => {
        return false;
      });

      expect(
        service.createUser({
          name: 'John Doe',
          username: 'john',
          password: 'Admin@123',
          email: 'johndoe@gmail.com',
          isAccountDisabled: false,
        }),
      ).resolves.toMatch('john');

      expect(isExistEmailSpy).toHaveBeenCalled();
      expect(isExistEmailSpy).toHaveBeenCalledTimes(1);

      // Restore the original method
      isExistEmailSpy.mockRestore();
    });
  });

  describe('get user', () => {
    it('Should be throw unauthorized error when user do not exist in system', async () => {
      await expect(
        service.findOne({ email: 'anna@gmail.com' }),
      ).rejects.toThrow(new UnauthorizedException());
    });

    it('Should be return a object user', async () => {
      const isExistEmailSpy = jest.spyOn(service, 'isExistEmail');
      isExistEmailSpy.mockImplementation(async () => {
        return false;
      });
      await service.createUser({
        name: 'Jane Doe',
        username: 'janedoe',
        password: 'Admin@123',
        email: 'janedoe@gmail.com',
        isAccountDisabled: false,
      });

      const result = await service.findOne({ email: 'janedoe@gmail.com' });
      expect(result?.email).toEqual('janedoe@gmail.com');
    });
  });

  describe('get uses', () => {
    it('Should be return a user array', async () => {
      expect(await service.find({ email: 'janedoe@gmail.com' })).toHaveLength(
        1,
      );
    });

    it('Should be return a empty array', async () => {
      expect(await service.find({ email: 'empty@gmail.com' })).toHaveLength(0);
    });
  });
});
