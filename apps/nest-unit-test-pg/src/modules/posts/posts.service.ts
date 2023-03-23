import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '../users/repositories/user.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostOutput } from './dto/post-output.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostsService {
  constructor(
    private userRepository: UserRepository,
    private postRepository: PostRepository,
  ) {}

  async create(input: CreatePostDto) {
    const { content, title, userId } = input;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const newPost = this.postRepository.create({
      content,
      title,
      user,
    });
    await this.postRepository.save(newPost);

    return plainToInstance(PostOutput, newPost, {
      excludeExtraneousValues: true,
    });
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
