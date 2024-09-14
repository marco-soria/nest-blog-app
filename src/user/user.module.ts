import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { EmailModule } from 'src/email/email.module';
import { UniqueEmail } from './validator/unique-email.validator';
import { AuthModule } from 'src/auth/auth.module';

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
export class UserModule {}
