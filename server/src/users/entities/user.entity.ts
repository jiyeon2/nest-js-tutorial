import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TodoEntity } from 'src/todos/entities/todo.entity';
@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({ nullable: true })
  kakaoId: number;

  @OneToMany((type) => TodoEntity, (todo) => todo.user)
  todos?: TodoEntity[];

  @BeforeInsert()
  hashPassword = async () => {
    this.password = await bcrypt.hash(this.password, 10);
  };
}
