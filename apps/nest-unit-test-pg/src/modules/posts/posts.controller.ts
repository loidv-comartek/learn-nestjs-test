import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '@app/common/dtos/base-api-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { JwtPayloadInterface } from '../auth/interfaces/jwt-payload.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { PostOutput } from './dto/post-output.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create post API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(PostOutput),
  })
  async create(
    @Request() req,
    @Body() input: CreatePostDto,
  ): Promise<BaseApiResponse<PostOutput>> {
    input.userId = (req.user as JwtPayloadInterface).sub;

    try {
      const newPost = await this.postsService.create(input);
      return { data: newPost, meta: {} };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts API',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    type: SwaggerBaseApiResponse(PostOutput),
  })
  async findAll(): Promise<BaseApiResponse<PostOutput[]>> {
    const allPosts = await this.postsService.findAll();

    return { data: allPosts, meta: {} };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by id API',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    type: SwaggerBaseApiResponse(PostOutput),
  })
  async findOne(@Param('id') id: string): Promise<BaseApiResponse<PostOutput>> {
    const post = await this.postsService.findOne(+id);

    return { data: post, meta: {} };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update post API',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: SwaggerBaseApiResponse(Boolean),
  })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<BaseApiResponse<boolean>> {
    try {
      const updateResult = await this.postsService.update(+id, updatePostDto);
      return { data: updateResult, meta: {} };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete post API',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: SwaggerBaseApiResponse(Boolean),
  })
  async remove(@Param('id') id: string): Promise<BaseApiResponse<boolean>> {
    try {
      const deleteResult = await this.postsService.remove(+id);
      return { data: deleteResult, meta: {} };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
