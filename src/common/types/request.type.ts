import { Request } from 'express';
import { JwtPayload } from 'src/config/jwt';

export interface CustomRequest extends Request {
  user: JwtPayload;
}
