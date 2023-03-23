import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'class-validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { AuthModule } from './modules/auth/auth.module';
import { EnvModule } from '@app/common/env/env.module';
import { setupDataSource } from '../test/test-utils';
import { dataSource } from './configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      expandVariables: true,
    }),
    EnvModule,
    // TypeOrmModule.forRootAsync({
    //   useClass: TypeOrmConfigService,
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        migrationsRun: false,
      }),
      dataSourceFactory: async () => {
        if (process.env.NODE_ENV === 'test') {
          return setupDataSource();
        } else return dataSource;
      },
    }),
    UsersModule,
    PostsModule,
    AuthModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
