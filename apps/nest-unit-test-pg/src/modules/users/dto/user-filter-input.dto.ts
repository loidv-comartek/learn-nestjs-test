import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class FilterUserInput {
  @ApiProperty({
    type: Number,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: number;

  @ApiProperty({
    type: String,
    default: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    type: String,
    default: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;
}
