import { Exclude, Expose, Type } from 'class-transformer';
import { Flashcard } from 'src/entities/flashcard.entity';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}

export class ResponseStudySetDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  tags?: string[];

  @Expose()
  isPublic: boolean;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Exclude()
  flashcards: Flashcard[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
