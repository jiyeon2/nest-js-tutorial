import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );
  const whiteList = ['http://localhost:3000'];
  app.enableCors({
    origin: whiteList,
    credentials: true,
  });

  await app.listen(port);
  Logger.log(`server started running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
