import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModuleOptions } from './config/database.configuration';

@Module({
  imports: [
    // TypeOrmModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => {
    //     const dbHost = configService.get<string>('DB_HOST');
    //     return {
    //       type: 'sqlite',
    //       database: dbHost,
    //       synchronize: false,
    //       entities: [User],
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync(DatabaseModuleOptions),
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'development' ? '.dev.env' : '.env',
      isGlobal: true,
    }),

    UserModule,

    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
