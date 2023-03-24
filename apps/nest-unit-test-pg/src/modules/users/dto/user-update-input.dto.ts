import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateUserInput {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @Length(6, 100)
  @IsAlphanumeric()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isAccountDisabled?: boolean;
}
