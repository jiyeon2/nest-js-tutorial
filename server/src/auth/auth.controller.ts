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

  @Post('send-reset-password-email')
  async sendResetPasswordMail(@Body('email') email: string) {
    try {
      if (!email) {
        throw new HttpException('email required', HttpStatus.BAD_REQUEST);
      }

      const user = await this.usersService.findByEmail(email);
      await this.authService.sendPasswordResetEmail(user.id, email);
      return {
        message: 'email sent',
      };
    } catch (e) {
      console.error(e);
      if (e.status === 500) {
        // 메일전송에러
        throw new HttpException(e.response, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password-by-email')
  async resetPasswordByEmail(
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

  @Post('send-user-auth-email')
  async sendUserAuthEmail(@Body('email') email: string) {
    console.log('send-user-auth-email', email);
    try {
      // 라우트 핸들러에서 email 값의 여부를 확인하는것은 single responsibility rule에 어긋난다
      // validator class 를 만들어서 처리할 수도 있지만, 핸들러 함수 전에 validator를 호출해야한다
      // middleware는 execution context에 대한 정보가 없으므로 generic middleware 만드는 것은 불가능하다
      // 이런 경우에 pipe를 사용한다
      if (!email) {
        throw new HttpException('email required', HttpStatus.BAD_REQUEST);
      }

      const authCode = await this.authService.sendUserAuthEmail(email);
      return {
        message: 'email sent',
        authCode,
      };
    } catch (e) {
      console.error(e, 'error');
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
