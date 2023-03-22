import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class User {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({ unique: true })
  username: string;

  @Prop()
  isAccountDisabled: boolean;

  @Prop({ unique: true })
  email: string;
}
