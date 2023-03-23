import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserOutput } from '../../users/dto/user-output.dto';

export class PostOutput {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  content: string;

  @Expose()
  @ApiProperty()
  @Type(() =>
    OmitType(UserOutput, ['createdAt', 'updatedAt', 'isAccountDisabled']),
  )
  user: UserOutput;
}
