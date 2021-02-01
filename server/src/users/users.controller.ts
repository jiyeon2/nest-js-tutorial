import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('send-mail')
  async sendMail(@Body('email') email: string) {
    await this.usersService.sendMail(email);
    return {
      message: 'email sent',
    };
  }
}
