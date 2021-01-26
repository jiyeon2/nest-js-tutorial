import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.tdo';
import { Movie } from './entities/movie.entity';
import { MoviesService } from './movies.service';

@Controller('movies') // router
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}
  @Get() // routes
  getAll(): Movie[] {
    return this.moviesService.getAll();
  }

  // @Get('search')
  // search(@Query('year') searchingYear: string) {
  //   return `we are searching for a movie made after: ${searchingYear}`;
  // }

  @Get(':id')
  getOne(@Param('id') movieId: number): Movie {
    console.log(typeof movieId);
    return this.moviesService.getOne(movieId);
  }

  @Post()
  create(@Body() movieData: CreateMovieDto) {
    return this.moviesService.create(movieData);
  }

  @Delete(':id')
  deleteMovie(@Param('id') movieId: number) {
    return this.moviesService.deleteOne(movieId);
  }

  // @Put() // 모든 리소스 업데이트
  @Patch(':id') // 리소스 일부 업데이트
  patch(@Param('id') movieId: number, @Body() updateData: UpdateMovieDto) {
    return this.moviesService.update(movieId, updateData);
  }
}
