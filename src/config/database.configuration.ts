import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Article } from 'src/article/article.entity';
import { Token } from 'src/auth/token.entity';
import { Reaction } from 'src/reaction/reaction.entity';
import { User } from 'src/user/user.entity';

export const DatabaseModuleOptions: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => {
    const dbHost = configService.get<string>('DB_HOST');
    return {
      type: 'sqlite',
      database: dbHost,
      synchronize: false,
      entities: [User, Token, Article, Reaction],
    };
  },
  inject: [ConfigService],
};
