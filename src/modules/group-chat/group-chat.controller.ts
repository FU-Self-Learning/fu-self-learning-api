import { Controller, Post, Body, UseGuards, Request, Get, Param, Req } from '@nestjs/common';
import { GroupChatService } from './group-chat.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from 'src/config/jwt/jwt-auth.guard';

@Controller('group-chat')
@UseGuards(JwtAuthGuard)
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post('join-community')
  async joinCommunityGroupChat(@Req() req, @Body('courseId') courseId: number) {
    return this.groupChatService.joinCommunityGroupChat(req.user.id, courseId);
  }

  @Post('create')
  async createGroup(@Body() dto: CreateGroupDto, @Request() req) {
    return this.groupChatService.createGroup(dto, req.user.id);
  }

  @Get('my-groups')
  async getUserGroups(@Request() req) {
    return this.groupChatService.getUserGroups(req.user.id);
  }

  @Get(':groupId/messages')
  async getGroupMessages(@Param('groupId') groupId: number) {
    return this.groupChatService.getGroupMessages(groupId);
  }
}
