import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, response, Response } from 'express';
import { UsersService } from '../../users/users.service';

// 로그인 시도 중 일어나는 에러(비밀번호 틀림, 없는 유저아이디 입력 등)
// 에러 발생 시 해당 유저의 로그인 시도 정보 조회& 업데이트 후
// 로그인 시도가 5번 이하인 경우, 5번 초과인 경우 다른 응답메시지와 데이터를 보내
// 프론트에서 다른 메시지 보여줌
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private usersService: UsersService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;
    try {
      const [
        loginTryCount,
        isLocked,
      ] = await this.usersService.checkLoginTryCount(request.body.username); // 해당 유저의 로그인 시도 횟수 조회

      const data = isLocked ? { isLocked } : { loginTryCount };

      response.status(status).json({ message, ...data });
    } catch (error) {
      response.status(error.status).json({
        message: `http-exception filter catch error ${error}`,
      });
    }
  }
}
