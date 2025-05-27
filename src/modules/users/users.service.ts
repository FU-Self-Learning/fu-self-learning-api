import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile-dto';
import { UpdateForgotPasswordUserDto } from './dto/update-forgot-password';
import { JwtPayload, TokenService } from 'src/config/jwt';
import { EmailService } from 'src/modules/email/email.service';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { plainToInstance } from 'class-transformer';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findUserByName(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(infoRegister: RegisterDto): Promise<User> {
    const user = this.usersRepository.create(infoRegister);
    return await this.usersRepository.save(user);
  }

  async updateProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserInfoDto> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return plainToInstance(UserInfoDto, this.usersRepository.save({ ...user, ...updateProfileDto }));
  }

  // Xóa người dùng
  async remove(id: number): Promise<void> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.usersRepository.remove(user);
  }
  // lấy profile info của người dùng
  async getProfile(id: number): Promise<UserInfoDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return plainToInstance(UserInfoDto, user);
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserInfoDto> {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, {
      password: hashedNewPassword,
    });

    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new BadRequestException('Failed to update user');
    }
    return plainToInstance(UserInfoDto, updatedUser);
  }

  async sendForgotPassword(email: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const payload: JwtPayload = {
        username: user.username,
        uid: user.id.toString(),
        email: user.email,
        role: user.role,
        sub: user.id,
      };

      const token: string = this.tokenService.generateAccessToken(payload);
      await this.emailService.sendForgotPasswordEmail(
        user.username,
        user.email,
        token,
      );
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateNewPassword(
    updateForgotPasswordUserDto: UpdateForgotPasswordUserDto,
  ): Promise<boolean> {
    const { token, password } = updateForgotPasswordUserDto;
    const verifiedToken = this.tokenService.verifyToken(token);
    const user = await this.usersRepository.findOne({
      where: { id: verifiedToken.sub },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const hashedNewPassword = await bcrypt.hash(
      updateForgotPasswordUserDto.password,
      10,
    );

    await this.usersRepository.update(user.id, { password: hashedNewPassword });
    return true;
  }

  async uploadAvatar(userId: number, file: Express.Multer.File): Promise<UserInfoDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      // Delete old avatar if exists
      if (user.avatar_url) {
        const publicId = this.extractPublicIdFromUrl(user.avatar_url);
        await this.cloudinaryService.deleteImage(publicId);
      }

      // Upload new avatar
      const result = await this.cloudinaryService.uploadImage(file.path);
      
      // Update user with new avatar URL
      user.avatar_url = result.secure_url;
      const updatedUser = await this.usersRepository.save(user);
      
      return plainToInstance(UserInfoDto, updatedUser);
    } catch (error) {
      throw new BadRequestException('Failed to upload avatar: ' + error.message);
    }
  }

  private extractPublicIdFromUrl(url: string): string {
    const filename = url.split('/').pop();
    return filename?.split('.')[0] ?? '';
  }
}
