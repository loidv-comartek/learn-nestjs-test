import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '@app/common/dtos/base-api-response.dto';
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/auth-login-input.dto';
import { RegisterInput } from './dto/auth-register-input.dto';
import { RegisterOutput } from './dto/auth-register-output.dto';
import { AuthTokenOutput } from './dto/auth-token-output.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'User registration API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(RegisterOutput),
  })
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
}
