import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toUserDto } from 'src/shared/mapper';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { comparePasswords } from '../shared/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(options?: Record<string, unknown>): Promise<UserDto> {
    const user = await this.usersRepository.findOne(options);
    return toUserDto(user);
  }

  async getById(id: string) {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      console.log('get by id', user);
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({ username });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  // 유저가 로그인할때 auth service에서 사용
  async findByLogin({ username, password }: LoginUserDto): Promise<UserDto> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }

    const areEqual = await comparePasswords(user.password, password);

    if (!areEqual) {
      throw new HttpException('invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return toUserDto(user);
  }

  async findByPayload({ username }: any): Promise<UserDto> {
    return await this.findOne({ where: { username } });
  }

  async findByKakaoId(kakaoId: number): Promise<UserDto> {
    try {
      return await this.usersRepository.findOne({ where: { kakaoId } });
    } catch (e) {
      console.error(e);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { username, password, email, kakaoId } = createUserDto;

    const userInDB = await this.usersRepository.findOne({
      where: { username },
    });

    if (userInDB) {
      throw new HttpException('user already exist', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersRepository.create({
      username,
      password,
      email,
      kakaoId,
    });
    await this.usersRepository.save(user);

    return toUserDto(user);
  }
}
