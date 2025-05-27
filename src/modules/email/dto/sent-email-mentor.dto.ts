import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailNewMentorDto {
  @Expose()
  @IsNotEmpty()
  fullName: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsNotEmpty()
  password: string;
}
