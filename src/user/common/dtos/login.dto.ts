import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UserLoginDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(5)
  @MaxLength(10)
  password: string;
}
