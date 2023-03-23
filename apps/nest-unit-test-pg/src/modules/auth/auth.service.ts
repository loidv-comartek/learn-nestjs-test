import { EnvService } from '@app/common/env/env.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { UserOutput } from '../users/dto/user-output.dto';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/auth-login-input.dto';
import { RegisterInput } from './dto/auth-register-input.dto';
import { RegisterOutput } from './dto/auth-register-output.dto';
import {
  AuthTokenOutput,
  UserAccessTokenClaims,
} from './dto/auth-token-output.dto';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private userService: UsersService,
    private env: EnvService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserAccessTokenClaims> {
    // The userService will throw Unauthorized in case of invalid username/password.
    const user = await this.userService.validateUsernamePassword(
      username,
      pass,
    );

    // Prevent disabled users from logging in.
    if (user.isAccountDisabled) {
      throw new UnauthorizedException('This user account has been disabled');
    }

    return user;
  }

  async login(input: LoginInput): Promise<AuthTokenOutput> {
    const user = await this.validateUser(input.username, input.password);
    return this.getAuthToken(user);
  }

  async recoveryAccountOrder(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return true;
    setTimeout(() => {
      console.log(`sending email to ${email}`);
    }, 1000);
    return true;
  }

  getAuthToken(user: UserAccessTokenClaims | UserOutput): AuthTokenOutput {
    const subject = { sub: user.id };
    const payload: JwtPayloadInterface = {
      username: user.username,
      sub: user.id,
    };

    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: `${this.env.get('JWT_REFRESH_TOKEN_EXP_IN_SEC')}s`,
        secret: this.env.get('JWT_TOKEN_REFESH_KEY'),
      }),

      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        {
          expiresIn: `${this.env.get('JWT_ACCESS_TOKEN_EXP_IN_SEC')}s`,
          secret: this.env.get('JWT_TOKEN_ACCESS_KEY'),
        },
      ),
    };
    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    });
  }

  async register(input: RegisterInput): Promise<RegisterOutput> {
    const user = await this.userRepository.findOne({
      where: [{ username: input.username }, { email: input.email }],
    });
    if (user) throw new BadRequestException();
    const registeredUser = await this.userService.createUser(input);
    return plainToClass(RegisterOutput, registeredUser, {
      excludeExtraneousValues: true,
    });
  }
}
