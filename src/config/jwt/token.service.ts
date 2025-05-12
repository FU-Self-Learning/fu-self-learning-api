import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt-payload.interface';
import { ErrorMessage } from 'src/common/constants/error-message.constant';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '1d',
    });
  }

  generateRefreshToken(payload: JwtPayload, expiresIn: string): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn,
    });
  }

  verifyToken(token: string, isRefreshToken: boolean = false): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: isRefreshToken 
          ? this.configService.get('JWT_REFRESH_SECRET')
          : this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException(ErrorMessage.INVALID_TOKEN);
    }
  }
}
