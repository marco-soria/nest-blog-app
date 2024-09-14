import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { GenericExceptionFilter } from './shared';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) =>
        new BadRequestException('Invalid request', { cause: errors }),
    }),
  );
  app.useGlobalFilters(new GenericExceptionFilter());
  app.use(cookieParser()); //  this line adds the cookie-parser middleware to the application
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); //  this line provides the container to the class-validator library
  await app.listen(8080);
}
bootstrap();
