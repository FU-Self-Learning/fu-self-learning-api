import { Controller, Post, Body, HttpCode, UseGuards, Get, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './chatbot.dto';
import { JwtAuthGuard } from 'src/config/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { Roles } from 'src/config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Student)
  async handleMessage(@Body() messageDto: ChatMessageDto, @GetUser() user: User) {
    const sessionId = messageDto.sessionId || user?.id?.toString() || 'default';
    return this.chatbotService.processMessage({ ...messageDto, sessionId, userId: user?.id?.toString() });
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Student)
  async getHistory(@Query('sessionId') sessionId: string, @GetUser() user: User) {
    const key = sessionId || user?.id?.toString() || 'default';
    return this.chatbotService.getHistory(key);
  }
}
