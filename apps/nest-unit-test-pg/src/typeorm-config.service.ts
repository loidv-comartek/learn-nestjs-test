import { EnvService } from '@app/common/env/env.service';
import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly env: EnvService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    //typeorm config
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      entities: [User],
      database: this.env.get('PG_DATABASE'),
      port: this.env.get('PG_PORT'),
      host: this.env.get('PG_HOST'),
      username: this.env.get('PG_USER'),
      password: this.env.get('PG_PASS'),
      synchronize: true,
    };
    return options;
  }
}
