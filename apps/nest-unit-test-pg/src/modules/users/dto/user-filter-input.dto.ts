import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterUserInput {
  @ApiProperty({
    type: String,
    default: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    type: Number,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: number;
}
