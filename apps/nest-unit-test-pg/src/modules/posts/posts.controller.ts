import { SwaggerBaseApiResponse } from '@app/common/dtos/base-api-response.dto';
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
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create post API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(PostOutput),
  })
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() input: CreatePostDto) {
    input.userId = (req.user as JwtPayloadInterface).sub;

    return this.postsService.create(input);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
