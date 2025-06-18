import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/config/jwt';
import { UpdateProfileDto } from './dto/update-profile-dto';
import { UpdateForgotPasswordUserDto } from './dto/update-forgot-password';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { FileValidator } from 'src/common/validators/file.validator';
import { storage } from 'src/common/constants/storage';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserInfoDto> {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
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

  @Patch('reset-password/:id')
  async resetPassword(@Param('id', ParseIntPipe) id: number): Promise<UserInfoDto> {
    return await this.usersService.resetPassword(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage }))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserInfoDto> {

    FileValidator.validateImage(file);
    this.cloudinaryService.validateFile(file, 'image');
    return this.usersService.uploadAvatar(req.user.id, file);
  }
}
