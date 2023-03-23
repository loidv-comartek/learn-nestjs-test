import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Post } from '../modules/posts/entities/post.entity';
import { User } from '../modules/users/entities/user.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

let config: TypeOrmModuleOptions & PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: +process.env.PG_PORT,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DATABASE,
  entities: [User, Post],
  synchronize: true,
  migrationsRun: false,
  migrations: ['dist/migrations/*.js'],
};

switch (process.env.NODE_ENV) {
  case 'test':
    config = {
      ...config,
      migrationsRun: false,
      migrationsTransactionMode: 'each',
      synchronize: false,
    };
    console.log('config :>> ', config);
    break;
}

export const dataSource = new DataSource(config);
export { config };
