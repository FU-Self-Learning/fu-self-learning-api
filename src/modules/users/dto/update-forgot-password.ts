import { Expose } from 'class-transformer';
import { IsString, Matches, IsNotEmpty } from 'class-validator';
import { PASSWORD_REGEX_PATTERN } from 'src/common/constants/regex';

export class UpdateForgotPasswordUserDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Expose()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX_PATTERN, {
    message:
      'New password must be at least 8 characters, with numbers, lowercase letters, uppercase letters and special characters',
  })
  password: string;
}
