import { EnvService } from '@app/common/env/env.service';
import { Injectable } from '@nestjs/common';
import {
  MongooseModuleFactoryOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongoConfigService implements MongooseOptionsFactory {
  constructor(private readonly envService: EnvService) {}
  createMongooseOptions():
    | Promise<MongooseModuleFactoryOptions>
    | MongooseModuleFactoryOptions {
    return {
      uri: this.envService.get('MONGODB_URI'),
    };
  }
}
