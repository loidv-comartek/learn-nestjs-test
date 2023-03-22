import { plainToClass } from 'class-transformer';
import { IsInt, IsOptional, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsInt()
  PORT_APP_PG: number;

  @IsInt()
  PORT_APP_MONGO: number;

  @IsInt()
  @IsOptional()
  PG_PORT: number;

  @IsString()
  @IsOptional()
  PG_HOST: string;

  @IsString()
  @IsOptional()
  PG_NAME: string;

  @IsString()
  @IsOptional()
  PG_USER: string;

  @IsString()
  @IsOptional()
  PG_PASS: string;

  @IsString()
  @IsOptional()
  MONGODB_URI: string;

  @IsInt()
  JWT_ACCESS_TOKEN_EXP_IN_SEC: number;

  @IsInt()
  JWT_REFRESH_TOKEN_EXP_IN_SEC: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors[0].toString());
  }
  return validatedConfig;
}
