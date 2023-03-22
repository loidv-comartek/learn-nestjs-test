import { EnvModule } from '@app/common/env/env.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { MongoConfigService } from './mongo-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      expandVariables: true,
    }),
    EnvModule,
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
