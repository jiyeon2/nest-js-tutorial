import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    UsersModule, // usersService 사용하기 위해 임포트
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user', // Request 객체에 추가될 인증된 유저 가리킬 프로퍼티(default : user)
      session: false,
    }), // 명시적으로 jwt strategy로 유저 인증하겠다
    JwtModule.register({
      secret: process.env.SECRETKEY,
      signOptions: { expiresIn: '30m' },
      // signOptions: { expiresIn: process.env.EXPIRESIN },
    }), // jwt 인증 관련 유틸리티 함수 제공하는 모듈, sign() 함수
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule], // 다른 모듈에서 AuthGuard사용하고 싶으면 다른 모듈에서 Authmodule이랑 PassportModule 임포트해야함
})
export class AuthModule {}
