import { FilterUserInput } from './dto/user-filter-input.dto';
import { Controller, Body, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserInput } from './dto/user-update-input.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'get users',
  })
  @Get()
  async users(@Query() filterUser: FilterUserInput) {
    return await this.usersService.find(filterUser);
  }

  @ApiOperation({
    summary: 'get user by id',
  })
  @Get(':id')
  async user(@Param('id') id: number) {
    return await this.usersService.findOne({ id: id });
  }

  @ApiOperation({
    summary: 'update users',
  })
  @Patch()
  async updateUser(@Body() updateUserInput: UpdateUserInput) {
    return await this.usersService.update(updateUserInput);
  }
}
