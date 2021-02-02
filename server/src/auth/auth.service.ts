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
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokensRepository: Repository<TokenEntity>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async getAuthenticatedUser(username: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.findByUsername(username);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;

      if (user.isLocked) {
        throw new HttpException('user is locked', HttpStatus.BAD_REQUEST);
      }

      return user;
    } catch (e) {
      throw new HttpException(
        ` ${e.response}, wrong credentials provide`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getCookieWithJwtToken(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/ Max-Age=${
      1000 * 60 * 60
    }`;
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'wrong credentials provide',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status = {
      success: true,
      message: 'user registered',
      user: null,
    };

    try {
      status.user = await this.usersService.create(userDto);
    } catch (error) {
      status = {
        ...status,
        success: false,
        message: error.message,
      };
    }
    return status;
  }

  // jwt strategy에서 유저 유효한지 확인할 때 사용
  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    // passport 미들웨어 실행 후 토큰이 유효한 경우에 한해 JwtStrategy.validate()함수에서 호출된다
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
    await this.saveRefreshToken(user.username, refreshToken);
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
    await this.saveRefreshToken(user.username, refreshToken);
    return { username: user.username, ...refreshToken, ...accessToken };
  }

  async logout(username: string) {
    try {
      const token = await this.tokensRepository.find({ username });
      await this.tokensRepository.remove(token);
      return true;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async refreshToken(oldToken) {
    try {
      const verifiedTokenInfo = await this.jwtService.verifyAsync(oldToken);
      const user = await this.usersService.findByPayload({
        username: verifiedTokenInfo.username,
      });
      const newAccessToken = this._createToken(user);
      return newAccessToken;
    } catch (e) {
      throw new HttpException('리프레시 토큰 만료', HttpStatus.BAD_REQUEST); // -> 클라이언트에서 로그인창으로 이동시키기
    }
  }

  async saveRefreshToken(username, tokenInfo) {
    const { refreshToken, expiresIn } = tokenInfo;

    // tokenRepository에 리프레시 토큰을 저장
    const tokenFound = await this.tokensRepository.find({ username });
    if (tokenFound) {
      await this.tokensRepository.delete({ username });
    }

    //https://ichi.pro/ko/nestjs-aegseseu-mich-saelo-gochim-tokeun-jwt-injeung-guhyeon-166728990752775
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + expiresIn);
    return await this.tokensRepository.save({
      username,
      token: refreshToken,
      is_revoked: false,
      expires: expiration,
    });
  }

  private _createToken({ username }: UserDto) {
    const user: JwtPayload = { username };
    // payload는 내용
    const accessToken = this.jwtService.sign(user);
    // accessToken 은 할당된 토큰과 현재 유저의 이름(username)반환한다
    return {
      expiresIn: this.configService.get<string>('EXPIRESIN'), // process.env.EXPIRESIN,
      accessToken,
    };
  }

  private _createRefreshToken({ username }: UserDto) {
    const user = { username };
    const refreshToken = this.jwtService.sign(user, {
      expiresIn: '14d',
    });
    return {
      expiresIn: 1000 * 60 * 60 * 24 * 14, // '14d'
      refreshToken,
    };
  }

  async sendMail(userEmail): Promise<void> {
    console.log({ userEmail });
    try {
      await this.mailerService.sendMail({
        to: userEmail, // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content
      });
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'send mail error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
