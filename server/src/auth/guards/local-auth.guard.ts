import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    // const request: Request = context.switchToHttp().getRequest();
    // const response: Response = context.switchToHttp().getResponse();
    return super.canActivate(context);
  }
}
