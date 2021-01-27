import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt'; // jwt payload를 할당하는 유틸리티 함수 가지고 있음
import { JwtPayload } from './interface/payload.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegistrationStatus } from './interface/registration-status.interface';
import { UserDto } from 'src/users/dto/user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import 'dotenv/config';
import { KakaoLoginDto } from 'src/users/dto/kakao-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokensRepository: Repository<TokenEntity>,
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
    const accessToken = this._createToken(user);
    const refreshToken = this._createRefreshToken(user);
    await this.saveRefreshToken(user.username, refreshToken.refreshToken);
    return { username: user.username, ...refreshToken, ...accessToken };
  }

  async kakaoLogin(kakaoLoginDto: KakaoLoginDto) {
    const { kakaoId, username, email } = kakaoLoginDto;
    let user = await this.usersService.findByKakaoId(kakaoId);
    if (!user) {
      await this.register({
        username,
        password: username,
        email,
        kakaoId,
      });
      user = await this.usersService.findByKakaoId(kakaoId);
    }
    const accessToken = this._createToken(user);
    const refreshToken = this._createRefreshToken(user);
    await this.saveRefreshToken(user.username, refreshToken.refreshToken);
    return { username: user.username, ...refreshToken, ...accessToken };
  }

  async logout(username: string) {
    try {
      await this.tokensRepository.delete({ username });
      return true;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async refreshToken(oldToken) {
    // refreshToken 확인 후 새로운 accesstoken 발급하기
    return oldToken;
  }

  async saveRefreshToken(username, token) {
    // tokenRepository에 리프레시 토큰을 저장
    const tokenFound = await this.tokensRepository.find({ username });
    if (tokenFound) {
      await this.tokensRepository.delete({ username });
    }
    return await this.tokensRepository.save({ username, token });
  }

  private _createToken({ username, email }: UserDto) {
    const user: JwtPayload = { username, email };
    // payload는 내용
    const accessToken = this.jwtService.sign(user);
    // accessToken 은 할당된 토큰과 현재 유저의 이름(username)반환한다
    return {
      expiresIn: process.env.EXPIRESIN,
      accessToken,
    };
  }

  private _createRefreshToken({ username }: UserDto) {
    const user = { username };
    const refreshToken = this.jwtService.sign(user);
    return {
      expiresIn: '14d',
      refreshToken,
    };
  }
}
