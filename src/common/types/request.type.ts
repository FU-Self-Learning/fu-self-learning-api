import { Request } from 'express';
export interface UserInfo {
  uid: string;
  role: string;
  name: string;
  phone: string;
}
export interface CustomRequest extends Request {
  user: UserInfo;
}