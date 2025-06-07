import { IsInt, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  senderUserId: number;

  @IsInt()
  receiverUserId: number;

  @IsString()
  message: string;
}
