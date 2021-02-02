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
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import express from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RegistrationStatus } from './interface/registration-status.interface';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { KakaoLoginDto } from '../users/dto/kakao-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/users/entities/user.entity';
import RequestWithUser from './interface/requestWithUser.interface';
import { LoginExceptionFilter } from '../filter/login-exception.filter';
import { get } from 'http';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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
  @UseFilters(LoginExceptionFilter)
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

  @Post('send-reset-password-mail')
  async sendResetPasswordMail(@Body('email') email: string) {
    try {
      if (!email) {
        throw new HttpException('email required', HttpStatus.BAD_REQUEST);
      }

      const user = await this.usersService.findByEmail(email);
      await this.authService.sendMail(user.id, email);
      return {
        message: 'email sent',
      };
    } catch (e) {
      console.error(e, 'error');
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password-by-mail')
  async resetPasswordByMail(
    @Body('code') authCode: string,
    @Body('password') password: string,
  ) {
    try {
      // auth 테이블에 해당 코드가 있는지 확인
      const validAuthCodeData = await this.authService.findAuthCode(authCode);
      // 해당 코드 발급받은 유저 정보(비밀번호, 시도횟수, 이용정지상태) 업데이트
      await this.usersService.changePasswordAndUnlock(
        validAuthCodeData.userId,
        password,
      );
      // auth 테이블에서 해당 코드 삭제
      await this.authService.removeAuthCodeData(validAuthCodeData);

      return { message: 'password reset done' };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('error in reset password');
    }
  }

  @Get('code/:code')
  async checkValidAuthCode(@Param('code') authCode: string) {
    console.log({ authCode });
    const validAuthCodeData = await this.authService.findAuthCode(authCode);
    console.log(validAuthCodeData);
    return validAuthCodeData;
  }
}
