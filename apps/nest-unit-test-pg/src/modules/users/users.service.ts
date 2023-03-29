import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserInput } from './dto/user-create-input.dto';
import { UserOutput } from './dto/user-output.dto';
import { User } from './entities/user.entity';
import { compare, hash } from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { EnvService } from '@app/common/env/env.service';
import { FilterUserInput } from './dto/user-filter-input.dto';
import { UpdateUserInput } from './dto/user-update-input.dto';

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

    //handle email
    const isExistEmail = await this.isExistEmail(input.email);
    if (!isExistEmail) {
      new UnauthorizedException('email is exist in system');
    }

    //hash password
    user.password = await hash(input.password, 10);

    //save to db
    await this.repository.save(user);
    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async validateUsernamePassword(
    username: string,
    pass: string,
  ): Promise<UserOutput> {
    const user = await this.findOne({ username });

    const match = await compare(pass, user.password);
    if (!match) throw new UnauthorizedException();

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(filter: FilterUserInput) {
    const user = await this.repository.findOne({
      where: { ...filter },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async update(updateUserInput: UpdateUserInput) {
    return await this.repository.update(
      { id: updateUserInput.id },
      updateUserInput,
    );
  }

  async find(filter: FilterUserInput): Promise<User[]> {
    const users = await this.repository.find({ where: filter });
    return users;
  }

  async isExistEmail(email: string): Promise<boolean> {
    const count = await this.repository.findOne({ where: { email: email } });
    return !!count;
  }
}
