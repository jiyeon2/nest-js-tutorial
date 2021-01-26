import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
//module클래스 또한 provider를 주입할 수 있다(configuration 목적)
export class CatsModule {
  constructor(private catsService: CatsService) {}
}
