import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flashcard } from '../../entities/flashcard.entity';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { TopicModule } from '../topic/topic.module';

@Module({
    imports: [TypeOrmModule.forFeature([Flashcard]),
        TopicModule],
    controllers: [FlashcardsController],
    providers: [FlashcardsService],
    exports: [FlashcardsService],
})
export class FlashcardsModule { }
