import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { WinstonLogger } from './common/logger/logger.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionHandlerFilter } from './common/filters/exception-handler.filter';
import { LoggerModule } from './common/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { AiAgentModule } from './modules/ai-agent/ai-agent.module';
import { CourseModule } from './modules/course/course.module';
import { PostModule } from './modules/post/post.module';
import { FollowModule } from './modules/follow/follow.module';
import { CommentPostModule } from './modules/comment-post/comment-post.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
    }),
    WinstonModule.forRoot(WinstonLogger),
    LoggerModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
    AuthModule,
    ChatbotModule,
    AiAgentModule,
    CourseModule,
    PostModule,
    FollowModule,
    CommentPostModule,
    FlashcardsModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionHandlerFilter,
    },
  ],
})
export class AppModule {}
