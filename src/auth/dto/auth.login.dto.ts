import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, MaxLength, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  readonly email: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  readonly password: string;
}
