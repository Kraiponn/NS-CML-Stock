import { MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class UserUpdatePwdDTO {
  @MinLength(5)
  @MaxLength(16)
  @IsNotEmpty()
  currentPassword: string;

  @MinLength(5)
  @MaxLength(16)
  @IsNotEmpty()
  newPassword: string;
}
