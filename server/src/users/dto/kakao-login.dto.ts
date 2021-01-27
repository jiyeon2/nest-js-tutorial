import { IsNotEmpty } from 'class-validator';

export class KakaoLoginDto {
  @IsNotEmpty()
  readonly kakaoId: number;

  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  readonly email: string;
}
