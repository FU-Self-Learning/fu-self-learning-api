import { IsNotEmpty } from 'class-validator';

export class CreateFollowDto {
  @IsNotEmpty()
  followingId: number;
}