import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '../users/repositories/user.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostOutput } from './dto/post-output.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
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

    if (!user) {
      throw new Error('Can not find user creating the post');
    }

    const newPost = this.postRepository.create({
      content,
      title,
      user,
    });
    await this.postRepository.save(newPost);

    return this.getPostOutput(newPost) as PostOutput;
  }

  async findAll() {
    const allPosts = await this.postRepository.find({
      where: { deletedAt: null },
      relations: ['user'],
    });

    return this.getPostOutput(allPosts) as PostOutput[];
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['user'],
    });

    return this.getPostOutput(post) as PostOutput;
  }

  getPostOutput(input: Post | Post[]): PostOutput | PostOutput[] {
    return plainToInstance(PostOutput, input, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: number, input: UpdatePostDto) {
    const post = await this.findOne(id);
    if (!post) {
      throw new Error('Can not find post to update');
    }
    await this.postRepository.update({ id }, input);

    return true;
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    if (!post) {
      throw new Error('Can not find post to delete');
    }
    await this.postRepository.softDelete({ id });

    return true;
  }
}
