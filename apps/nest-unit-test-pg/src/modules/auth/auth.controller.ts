import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '@app/common/dtos/base-api-response.dto';
import { EnvService } from '@app/common/env/env.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/auth-login-input.dto';
import { RecoveryAccountOrderInput } from './dto/auth-recovery-input';
import { RecoveryAccountOrderOutput } from './dto/auth-recovery-output.dto';
import { RegisterInput } from './dto/auth-register-input.dto';
import { RegisterOutput } from './dto/auth-register-output.dto';
import { AuthTokenOutput } from './dto/auth-token-output.dto';
import { ResetInput } from './dto/auth-reset-input.dto';
import { User } from './decorators/user.decorator';
import { UserInRequest } from './types/user-in-request.type';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly envService: EnvService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'User registration API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(RegisterOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  async registerLocal(
    @Body() input: RegisterInput,
  ): Promise<BaseApiResponse<RegisterOutput>> {
    input.isAccountDisabled = false;
    const registeredUser = await this.authService.register(input);
    return { data: registeredUser, meta: {} };
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async login(
    @Body() input: LoginInput,
  ): Promise<BaseApiResponse<AuthTokenOutput>> {
    const authToken = await this.authService.login(input);
    return { data: authToken, meta: {} };
  }

  @Post('recovery')
  @ApiOperation({
    summary: 'recovery account order API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(RecoveryAccountOrderOutput),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async recovery(
    @Body() { email }: RecoveryAccountOrderInput,
  ): Promise<BaseApiResponse<RecoveryAccountOrderOutput>> {
    await this.authService.recoveryAccountOrder(email);
    return {
      data: {
        isSuccess: true,
        direct_url: `${this.envService.get('API_HOST_URL')}/api/v1/auth/login`,
        message:
          'Recovery request successfully, please check your email to recovering your account!',
      },
      meta: {},
    };
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'reset password account API ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async reset(
    @Body() { password }: ResetInput,
    @User() me: UserInRequest,
  ): Promise<BaseApiResponse<AuthTokenOutput>> {
    const user = await this.authService.resetPassword(me, password);
    return {
      data: {
        ...this.authService.getAuthToken(user),
      },
      meta: {},
    };
  }
}
