import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Req,
  Res,
} from '@nestjs/common';
import express from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RegistrationStatus } from './interface/registration-status.interface';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { KakaoLoginDto } from '../users/dto/kakao-login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegistrationStatus> {
    const result = await this.authService.register(createUserDto);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('login')
  public async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: express.Response,
  ) {
    const {
      refreshToken,
      username,
      accessToken,
    } = await this.authService.login(loginUserDto);
    // user에 토큰 붙여서 보내줌
    res.cookie('refresh_token', refreshToken, { httpOnly: true });
    res.send({
      access_token: accessToken,
      username,
    });
  }

  @Post('kakaoLogin')
  async kakaoLogin(
    @Body() kakaoLoginDto: KakaoLoginDto,
    @Res() res: express.Response,
  ) {
    const {
      refreshToken,
      username,
      accessToken,
    } = await this.authService.kakaoLogin(kakaoLoginDto);
    // user에 토큰 붙여서 보내줌
    res.cookie('refresh_token', refreshToken, { httpOnly: true });
    res.send({
      access_token: accessToken,
      username,
    });
  }

  @Post('logout')
  async logout(@Body('username') username: string) {
    return await this.authService.logout(username);
  }

  @Get('whoami')
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any) {
    return req.user;
  }

  @Post('refresh-token')
  async refreshToken(@Request() req: express.Request) {
    // refreshToken으로 accessToken을 요청한다
    // refreshToken이 정상적인 토큰인지?
    // refreshToken이 해당 username과 함께 db에 저장되어 있는지?
    // 확인한 후 accessToken을 다시 발급한다
    // refreshToken이 비정상이거나 만료된경우 front에 다시 로그인해야함을 알린다
  }
}
