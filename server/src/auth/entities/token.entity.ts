import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('token')
export class TokenEntity {
  @PrimaryColumn()
  token: string;

  @Column({ type: 'varchar', nullable: false })
  username: string;
}
