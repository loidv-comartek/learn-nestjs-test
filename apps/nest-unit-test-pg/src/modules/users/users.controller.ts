import { SwaggerBaseApiResponse } from '@app/common/dtos/base-api-response.dto';
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserInput } from './dto/user-create-input.dto';
import { UserOutput } from './dto/user-output.dto';
import { UpdateUserInput } from './dto/user-update-input.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async user(@Param('id') id: number) {
    console.log(id);
    return await this.usersService.findOne({ id: id });
  }

  @Patch()
  async updateUser(@Body() updateUserInput: UpdateUserInput) {
    return await this.usersService.update(updateUserInput);
  }
}
