import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokensRepository: Repository<TokenEntity>,
    @InjectRepository(AuthEntity)
    private readonly authsRepository: Repository<AuthEntity>,
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

  //https://techlog.io/Server/Node-js/node-js%EC%97%90%EC%84%9C-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%9D%B8%EC%A6%9D%EC%9D%84-%ED%86%B5%ED%95%9C-%EB%B9%84%EB%B0%80%EB%B2%88%ED%98%B8-%EC%B4%88%EA%B8%B0%ED%99%94-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0/
  async createAndSaveAuthCode(userId) {
    try {
      const authCode = crypto.randomBytes(20).toString('hex'); // token 생성

      const oldCode = await this.authsRepository.findOne({ where: { userId } });
      if (oldCode) {
        // 이전 인증요청이 있는 경우 - 존재하는 인증요청 authCode, ttl만 업데이트
        const updated = await this.authsRepository.update(
          { userId },
          { authCode, ttl: 300 },
        );
        console.log({ updated });
      } else {
        // 이전 인증요청이 없는 경우 - 새로 만들기
        const data = {
          authCode,
          userId,
          ttl: 300, // ttl 값 설정 (5분)
        };
        const newData = await this.authsRepository.save(data); // 데이터베이스 Auth 테이블에 데이터 입력
        console.log({ newData });
      }
      return authCode;
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'error in create auth code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendPasswordResetEmail(userId, userEmail): Promise<void> {
    const authCode = await this.createAndSaveAuthCode(userId);
    console.log('auth.service - sendmail', { authCode });
    const mailOption = {
      to: userEmail, // list of receivers
      from: '"No Reply - NestJs 공부하는중" <nestjs-study@ing>',
      subject: '테스트 비밀번호 변경하기', // Subject line
      html: `비밀번호 초기화를 위해 다음 링크를 클릭해주세요. 비밀번호 변경 페이지로 이동합니다 <a href="http://localhost:3000/reset-password/${authCode}">비밀번호 변경하기</a>`, // HTML body content
    };
    try {
      await this.mailerService.sendMail(mailOption);
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'send mail error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidCode(authCode) {
    console.log(authCode, authCode.created);
    const createdTime = new Date(authCode.created);
    const validTime = new Date(Date.now() - authCode.ttl);
    console.log({ createdTime, validTime });
    return Date.now() - authCode.ttl > authCode.created;
  }

  /**
   * 입력받은 코드가 auth테이블에 있는지 확인
   * @param code 유저가 메일로 받은 문자열(authCode)
   */
  async findAuthCode(code: string) {
    console.log({ code });
    try {
      const authCodeData = await this.authsRepository.findOne({
        authCode: code,
      });

      if (!authCodeData || !this.isValidCode(authCodeData)) {
        //  해당 토큰이 존재하지 않는 경우, 토큰이 만료된 경우 처리할 api 필요
        throw new HttpException(
          'not such auth code or outdated code',
          HttpStatus.BAD_REQUEST,
        );
      }
      return authCodeData;
    } catch (e) {
      console.error(e);
      throw new HttpException('not valid auth code', HttpStatus.BAD_REQUEST);
    }
  }

  async removeAuthCodeData(authCodeEntity) {
    try {
      await this.authsRepository.remove(authCodeEntity);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('error in removeAuthCodeData');
    }
  }

  async sendUserAuthEmail(email: string) {
    const authCode = crypto.randomBytes(20).toString('hex'); // token 생성
    console.log('auth.service - sendmail', { authCode });
    const mailOption = {
      to: email, // list of receivers
      from: '"No Reply - NestJs 공부하는중" <nestjs-study@ing>',
      subject: '유저 인증 코드', // Subject line
      html: `유저 인증 코드는 다음과 같습니다. \n ${authCode} \n 인증코드창에 입력해주세요`,
    };
    try {
      await this.mailerService.sendMail(mailOption);
      return authCode;
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'send mail error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
