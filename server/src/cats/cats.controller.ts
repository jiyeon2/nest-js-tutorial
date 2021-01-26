import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Res,
  HttpStatus,
  HttpException,
  UseFilters,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Response } from 'express';
import { Cat } from './entities/cat.entity';
import { HttpExceptionFilter } from '../http-exception.filter';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  // @UseFilters(new HttpExceptionFilter())
  @UseFilters(HttpExceptionFilter) // instance 보다 클래스 적용하는게 메모리 덜 사용함
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  findAll(): Cat[] {
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'this is a custom message',
      },
      HttpStatus.FORBIDDEN,
    );
    return this.catsService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.catsService.findOne(+id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
  //   return this.catsService.update(+id, updateCatDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.catsService.remove(+id);
  // }
}
