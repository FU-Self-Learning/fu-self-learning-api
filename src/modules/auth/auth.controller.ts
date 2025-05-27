// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Get,
  Res,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { TokenService, JwtAuthGuard, JwtPayload } from 'src/config/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Post('login')
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userInfo = await this.authService.login(loginDto);
    const payload: JwtPayload = {
      username: userInfo.username,
      sub: userInfo.id,
      email: userInfo.email,
      uid: userInfo.id.toString(),
      role: userInfo.role,
    };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload, '7d');

    return { accessToken, refreshToken, userInfo };
  }

  @Post('register')
  async register(
    @Body(new ValidationPipe()) registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.register(registerDto);
    return 'Registration successful';
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken } = await this.authService.refreshToken(refreshToken);

    return { accessToken };
  }

    @Get('activate')
  async activateAccount(@Query('token') token: string) {
    return await this.authService.activateAccount(token);
  }
}
