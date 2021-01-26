import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(AuthGuard('local'))// strategy 이름을 AuthGuard()안에 바로 넣어서 쓰지말고 아래처럼 클래스 정의해서 쓰기
  @UseGuards(LocalAuthGuard)
  // 해당 라우터는 유저가 유효할때만 실행됨, req.user가 존재한다(passport-local auth 에서 생성된것)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
