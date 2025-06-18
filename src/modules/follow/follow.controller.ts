import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../../config/jwt';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';

@Controller('follow')
export class FollowController {
    constructor(private readonly followService: FollowService) {}

    @UseGuards(JwtAuthGuard)
    @Post('toggle')
    toggleFollow(@Body() createFollowDto: CreateFollowDto, @Request() req) {
        return this.followService.toggleFollow(createFollowDto.followingId, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('followers')
    getFollowers(@Request() req) {
        return this.followService.getFollowers(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('following')
    getFollowing(@Request() req) {
        return this.followService.getFollowing(req.user.id);
    }
}
