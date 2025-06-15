import { IsInt, IsOptional } from 'class-validator';

export class LoadMessagesDto {
  @IsInt()
  senderUserId: number;

  @IsInt()
  receiverUserId: number;

  @IsOptional()
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  limit?: number = 20;
} 