import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { EmailModule } from 'src/email/email.module';
import { UniqueEmail } from './validator/unique-email.validator';
import { AuthModule } from 'src/auth/auth.module';
import { AuthUserMiddleware } from 'src/auth/auth-user.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    EmailModule,
  ],

  controllers: [UserController],
  providers: [UserService, UniqueEmail],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthUserMiddleware)
      .forRoutes({ path: 'users/*', method: RequestMethod.PUT });
  }
}
