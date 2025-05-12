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
        username: user.name,
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
}
