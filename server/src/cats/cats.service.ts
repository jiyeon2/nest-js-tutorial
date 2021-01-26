import { Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(createCatDto: CreateCatDto) {
    this.cats.push(createCatDto);
  }

  findAll() {
    return this.cats;
  }
}
