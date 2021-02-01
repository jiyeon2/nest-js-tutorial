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
  HttpCode,
  UseInterceptors,
  UseFilters,
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
import { UserEntity } from 'src/users/entities/user.entity';
import RequestWithUser from './interface/requestWithUser.interface';
import { HttpExceptionFilter } from './filter/http-exception.filter';
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

  // @HttpCode(200)
  // @UseGuards(LocalAuthGuard)
  // @Post('log-in')
  // async logIn(
  //   @Req() request: RequestWithUser,
  //   @Res() response: express.Response,
  // ) {
  //   const { user } = request;
  //   const cookie = this.authService.getCookieWithJwtToken(user.id);
  //   response.setHeader('Set-Cookie', cookie);
  //   user.password = undefined;
  //   return response.send(user);
  // }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Post('login')
  public async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const {
      refreshToken,
      username,
      accessToken,
    } = await this.authService.login(loginUserDto);

    // res.cookie('refresh_token', refreshToken, { httpOnly: true }); // req.cookie none으로 들어와서 일단 로컬스토리지에 저장할거임
    res.send({
      access_token: accessToken,
      refresh_token: refreshToken,
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
      refresh_token: refreshToken,
      username,
    });
  }

  @HttpCode(200)
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
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
