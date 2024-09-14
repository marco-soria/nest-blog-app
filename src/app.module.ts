import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModuleOptions } from './config/database.configuration';
import { AuthModule } from './auth/auth.module';
import { ArticleModule } from './article/article.module';
import { ReactionModule } from './reaction/reaction.module';
import { PaginationMiddleware } from './shared/pagination/pagination.middleware';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    ServeStaticModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const uploadFolder = configService.get<string>('UPLOAD_FOLDER');
        return [
          {
            rootPath: join(__dirname, '..', '..', uploadFolder),
            serveRoot: '/api/assets',
          },
        ];
      },
      inject: [ConfigService],
    }),

    UserModule,

    EmailModule,

    AuthModule,

    ArticleModule,

    ReactionModule,

    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PaginationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
