import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Article } from './article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUserMiddleware } from 'src/auth/auth-user.middleware';
import { ReactionModule } from 'src/reaction/reaction.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), AuthModule, ReactionModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthUserMiddleware)
      .forRoutes('articles', 'users/*/articles');
  }
}
