import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt'; // jwt payload를 할당하는 유틸리티 함수 가지고 있음
import { JwtPayload } from './interface/payload.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegistrationStatus } from './interface/registration-status.interface';
import { UserDto } from 'src/users/dto/user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status = {
      success: true,
      message: 'user registered',
    };

    try {
      await this.usersService.create(userDto);
    } catch (error) {
      status = {
        success: false,
        message: error.message,
      };
    }
    return status;
  }

  // jwt strategy에서 유저 유효한지 확인할 때 사용
  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    // passport.js 미들웨어가 거친 후 토큰이 유효한 경우에 한해 JwtStrategy.validate()함수에서 호출된다
    if (!user) {
      throw new HttpException('invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    // db에서 유저가 있는지, 패스워드가 맞는지 확인
    const user = await this.usersService.findByLogin(loginUserDto);

    // 토큰생성
    const token = this._createToken(user);

    return { username: user.username, ...token };
  }

  private _createToken({ username }: UserDto) {
    const user: JwtPayload = { username };
    // payload는 내용
    const accessToken = this.jwtService.sign(user);
    // accessToken 은 할당된 토큰과 현재 유저의 이름(username)반환한다
    return {
      expiresIn: process.env.EXPIRESIN,
      accessToken,
    };
  }
}
