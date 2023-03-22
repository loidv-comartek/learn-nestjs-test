import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserInput } from './dto/user-create-input.dto';
import { UserOutput } from './dto/user-output.dto';
import { User } from './entities/user.entity';
import { hash } from 'bcrypt';

import { EnvService } from '@app/common/env/env.service';

@Injectable()
export class UsersService {
  // constructor(env: EnvService) {}
  /**
   * create user
   * @param input CreateUserInput
   * @returns UserOutput
   */
  // async createUser(input: CreateUserInput): Promise<UserOutput> {
  //   const user = plainToClass(User, input);
  //   user.password = await hash(input.password, 10);
  //   await this.repository.save(user);
  //   return plainToClass(UserOutput, user, {
  //     excludeExtraneousValues: true,
  //   });
  // }
}
