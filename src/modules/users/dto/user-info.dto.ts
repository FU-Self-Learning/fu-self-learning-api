import { Exclude, Expose } from "class-transformer";

export class UserInfoDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  address: string;

  @Expose()
  role: string;

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
