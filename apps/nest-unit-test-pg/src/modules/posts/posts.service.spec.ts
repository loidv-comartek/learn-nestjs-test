import { Test, TestingModule } from '@nestjs/testing';
import { FindOneOptions, FindOptionsWhere } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';
import { PostRepository } from './repositories/post.repository';

describe('PostsService', () => {
  let service: PostsService;
  let userRepository: UserRepository;
  let postRepository: PostRepository;

  const userRepositoryMock = {
    provide: UserRepository,
    useValue: {
      findOne: jest.fn((options: FindOneOptions<User>) => {
        const findById = (options.where as FindOptionsWhere<User>).id;
        if (findById != 1) {
          return null;
        }
        return {
          id: 1,
          name: 'thinh',
          email: 'thinh@yahooo.com',
          username: 'thinh',
          isAccountDisabled: false,
        } as User;
      }),
    },
  };

  const postRepositoryMock = {
    provide: PostRepository,
    useValue: {
      create: jest.fn((post) => {
        post.id = 1;
        return post;
      }),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn((options: FindOneOptions<Post>) => {
        const findById = (options.where as FindOptionsWhere<Post>).id;
        if (findById != 1) {
          return null;
        }
        return {
          id: 1,
          title: 'Javascript tutorial',
          content: 'Learn by yourself',
          user: {
            name: 'thinh',
            email: 'thinh@yahooo.com',
            username: 'thinh',
            isAccountDisabled: false,
          },
        } as Post;
      }),
      update: jest.fn(() => true),
      softDelete: jest.fn(() => true),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, userRepositoryMock, postRepositoryMock],
    }).compile();

    service = module.get<PostsService>(PostsService);
    userRepository = module.get<UserRepository>(UserRepository);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe('create', () => {
    it('Can not find user creating the post', async () => {
      const input: CreatePostDto = {
        title: 'Javascript tutorial',
        content: 'Learn by yourself',
        userId: 2,
      };

      await expect(service.create(input)).rejects.toThrowError(
        'Can not find user creating the post',
      );
    });

    it('Successfully create post', async () => {
      const input: CreatePostDto = {
        title: 'Javascript tutorial',
        content: 'Learn by yourself',
        userId: 1,
      };

      await expect(service.create(input)).resolves.toEqual({
        id: 1,
        title: 'Javascript tutorial',
        content: 'Learn by yourself',
        user: {
          id: 1,
          name: 'thinh',
          email: 'thinh@yahooo.com',
          username: 'thinh',
        },
      });
    });
  });

  describe('findOne', () => {
    it('findOne by id', async () => {
      await expect(service.findOne(0)).resolves.toBeNull();
      await expect(service.findOne(1)).resolves.toBeDefined();
    });
  });

  describe('updateOne', () => {
    it('Can not find post to update', async () => {
      const input: UpdatePostDto = {
        title: 'Python Tutorial',
        content: 'Learn by yourself',
      };

      await expect(service.update(2, input)).rejects.toThrowError(
        'Can not find post to update',
      );
    });

    it('Update post successfully', async () => {
      const input: UpdatePostDto = {
        title: 'Python Tutorial',
        content: 'Learn by yourself',
      };

      await expect(service.update(1, input)).resolves.toBe(true);
    });
  });

  describe('deleteOne', () => {
    it('Can not find post to delete', async () => {
      await expect(service.remove(2)).rejects.toThrowError(
        'Can not find post to delete',
      );
    });

    it('Delete post successfully', async () => {
      await expect(service.remove(1)).resolves.toBe(true);
    });
  });
});
