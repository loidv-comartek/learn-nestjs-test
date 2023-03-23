import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RecoveryAccountOrderOutput {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  isSuccess: boolean;

  @ApiProperty()
  @Expose()
  direct_url: string;
}
