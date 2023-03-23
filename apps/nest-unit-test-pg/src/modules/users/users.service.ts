import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserInput } from './dto/user-create-input.dto';
import { UserOutput } from './dto/user-output.dto';
import { User } from './entities/user.entity';
import { compare, hash } from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { EnvService } from '@app/common/env/env.service';

@Injectable()
export class UsersService {
  constructor(private repository: UserRepository, env: EnvService) {}

  /**
   * create user
   * @param input CreateUserInput
   * @returns UserOutput
   */
  async createUser(input: CreateUserInput): Promise<UserOutput> {
    const user = plainToClass(User, input);

    user.password = await hash(input.password, 10);
    await this.repository.save(user);
    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async validateUsernamePassword(
    username: string,
    pass: string,
  ): Promise<UserOutput> {
    const user = await this.repository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException();

    const match = await compare(pass, user.password);
    if (!match) throw new UnauthorizedException();

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }
}
