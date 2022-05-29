import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class UserEntity {
  @Prop({
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  firstName: string;

  @Prop({
    required: false,
    index: true,
    lowercase: true,
    trim: true,
  })
  lastName?: string;

  @Prop({
    required: true,
    index: true,
    unique: true,
    trim: true,
  })
  mobileNumber: string;

  @Prop({
    required: true,
    index: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
    default: true,
  })
  isActive: boolean;
}

export const UserDatabaseName = 'users';
export const UserSchema = SchemaFactory.createForClass(UserEntity);

export type UserDocument = UserEntity & Document;

// Hooks
UserSchema.pre<UserDocument>('save', function (next) {
  this.email = this.email.toLowerCase();
  this.firstName = this.email.toLowerCase();

  if (this.lastName) {
    this.lastName = this.lastName.toLowerCase();
  }

  next();
});
