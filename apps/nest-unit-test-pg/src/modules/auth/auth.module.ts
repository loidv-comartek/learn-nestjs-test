import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from '@app/common/env/env.module';
import { EnvService } from '@app/common/env/env.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: async (env: EnvService) => ({
        secret: env.get('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: env.get('JWT_ACCESS_TOKEN_EXP_IN_SEC'),
        },
      }),
      inject: [EnvService],
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
