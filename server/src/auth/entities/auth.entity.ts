import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// 비밀번호 초기화, 로그인 인증에 사용되는 토큰 저장
@Entity('auth')
export class AuthEntity {
  @PrimaryColumn()
  authCode: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @Column({ default: 300 }) // 5분
  ttl: number;

  @CreateDateColumn()
  created: Date;
}
