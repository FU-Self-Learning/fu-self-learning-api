import { IsInt, IsString } from 'class-validator';

export class SendGroupMessageDto {
  @IsInt()
  groupId: number;

  @IsInt()
  senderId: number;

  @IsString()
  message: string;
}
