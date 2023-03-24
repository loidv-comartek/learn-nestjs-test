import { IsOptional, IsString } from 'class-validator';

export class FilterUserInput {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  id?: number;
}
