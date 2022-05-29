import { Exclude, Type } from 'class-transformer';

export class AuthLoginSerialization {
  @Type(() => String)
  readonly _id: string;
  readonly email: string;
  readonly isActive: boolean;

  @Exclude()
  readonly firstName: string;

  @Exclude()
  readonly lastName: string;

  @Exclude()
  readonly mobileNumber: string;

  @Exclude()
  readonly password: string;

  @Exclude()
  readonly createdAt: Date;

  @Exclude()
  readonly updatedAt: Date;
}
