import { Exclude, Expose } from 'class-transformer';

export class UserInfoDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  dob: Date;

  @Expose()
  avatarUrl: string;

  @Expose()
  role: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password?: string;

  constructor(partial: Partial<UserInfoDto>) {
    Object.assign(this, partial);
  }
}
