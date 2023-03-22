import { EnvironmentVariables } from './env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService) {}

  get(key: keyof EnvironmentVariables) {
    return this.configService.get(key);
  }

  isMasterProcess() {
    return (
      !process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0'
    );
  }
}
