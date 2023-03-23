import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoveryAccountOrderInput {
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  email: string;
}
