import { PickType } from '@nestjs/mapped-types';
import { CreateUserInput } from '../../users/dto/user-create-input.dto';

export class ResetInput extends PickType(CreateUserInput, ['password']) {}
