import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from 'src/entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { ErrorMessage } from 'src/common/constants/error-message.constant';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from '../../config/jwt/token.service';
import { UserInfoDto } from '../users/dto/user-info.dto';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from 'src/config/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async register(infoRegister: RegisterDto): Promise<UserInfoDto> {
    if (infoRegister.confirmPassword !== infoRegister.password) {
      throw new BadRequestException({
        message: ErrorMessage.REGISTER_FAILED,
        description: 'Password does not match',
      });
    }
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(infoRegister.password, salt);

    const existingUser = await this.userService.findUserByEmail(
      infoRegister.email,
    );
    if (existingUser) {
      throw new BadRequestException({
        message: ErrorMessage.REGISTER_FAILED,
        description: 'Account has same email already registered',
      });
    }

    const user = await this.userService.create({
      ...infoRegister,
      password: hashedPassword,
    });
    if (!user) {
      throw new BadRequestException(ErrorMessage.INTERNAL_ERROR);
    }

    await this.userService.sendActiveUser(user.email);

    return plainToInstance(UserInfoDto, user);
  }

  async googleLogin(googleUser: any): Promise<UserInfoDto> {
    const { email, name, picture } = googleUser;
    let user = await this.userService.findUserByEmail(email);
    if (!user) {
      user = await this.userService.createByGoogle({
        email,
        username: name,
        avatarUrl: picture,
        password: '',
        confirmPassword: '',
      });
    }
    return plainToInstance(UserInfoDto, user);
  }

  async login(infoLogin: LoginDto): Promise<UserInfoDto> {
    const user = await this.userService.findUserByEmail(infoLogin.email);
    if (!user) {
      throw new BadRequestException({
        message: ErrorMessage.LOGIN_FAILED,
        description: 'Email or password are incorrect',
      });
    }
    if (!user.isActive) {
      throw new BadRequestException({
        message: ErrorMessage.LOGIN_FAILED,
        description: 'Account is not activated',
      });
    }
    const isPasswordValid = await bcryptjs.compare(
      infoLogin.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException({
        message: ErrorMessage.LOGIN_FAILED,
        description: 'Email or password are incorrect',
      });
    }

    return plainToInstance(UserInfoDto, user);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.tokenService.verifyToken(refreshToken, true);
      const user = await this.userService.findUserById(decoded.sub);
      if (!user) {
        throw new BadRequestException(ErrorMessage.INVALID_TOKEN);
      }
      const payload: JwtPayload = {
        username: user.username,
        uid: user.id.toString(),
        role: user.role,
        email: user.email,
        sub: user.id,
      };
      const newAccessToken = this.tokenService.generateAccessToken(payload);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new BadRequestException(ErrorMessage.INVALID_TOKEN);
    }
  }

  async validateUser(name: string, pass: string): Promise<User> {
    const user = await this.userService.findUserByName(name);
    if (user && user.password === pass) {
      return user;
    }
    throw new BadRequestException(ErrorMessage.ACCESS_DENIED);
  }

  async activateAccount(token: string): Promise<boolean> {
    try {
      const decoded = this.tokenService.verifyToken(token);

      const user = await this.userService.findUserById(decoded.sub);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.isActive) {
        throw new BadRequestException('Account has been activated before');
      }

      await this.userService.updateUserStatus(user.id, true);

      return true;
    } catch (error) {
      throw new BadRequestException('Activation code is invalid or expired');
    }
  }
}
