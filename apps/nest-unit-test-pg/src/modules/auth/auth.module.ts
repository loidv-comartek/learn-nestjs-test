import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from '@app/common/env/env.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        signOptions: {
          expiresIn: `${envService.get('JWT_ACCESS_TOKEN_EXP_IN_SEC')}s`,
        },
        secret: envService.get('JWT_TOKEN_SECRET_KEY'),
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
