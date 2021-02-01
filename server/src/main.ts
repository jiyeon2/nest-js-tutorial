import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
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
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials: true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });
  app.use(cookieParser());

  await app.listen(port);
  Logger.log(`server started running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
