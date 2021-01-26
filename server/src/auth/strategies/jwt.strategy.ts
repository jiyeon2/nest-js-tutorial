import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interface/payload.interface';
import { UserDto } from 'src/users/dto/user.dto';
import 'dotenv/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 요청 헤더에서 bearer token으로 jwt를 가져옴
      ignoreExpiration: false,
      secretOrKey: process.env.SECRETKEY, // jwt 복호화해서 유효한지 확인할 때 사용
      // JwtModule에 넘긴 값과 같은 값 사용할것
    });
  }

  // jwt strategy는 토큰 추출해서 유효한지 확인함
  // 토큰이 유효하지 않으면 401 응답
  // 유효하면 validate 함수 실행
  async validate(payload: JwtPayload): Promise<UserDto> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new HttpException('invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
