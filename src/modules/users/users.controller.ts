import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/config/jwt';
import { UpdateProfileDto } from './dto/update-profile-dto';
import { UpdateForgotPasswordUserDto } from './dto/update-forgot-password';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserInfoDto } from './dto/user-info.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('me')
  async updateMe(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserInfoDto> {
    return await this.usersService.changePassword(
      req.user.userId,
      changePasswordDto,
    );
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<boolean> {
    return await this.usersService.sendForgotPassword(email);
  }

  @Post('/update-forgot-password')
  async updateForgotPassword(
    @Body() updateForgotPasswordUserDto: UpdateForgotPasswordUserDto,
  ): Promise<boolean> {
    return await this.usersService.updateNewPassword(
      updateForgotPasswordUserDto,
    );
  }
}
