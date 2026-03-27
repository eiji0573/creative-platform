import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { FollowsModule } from './follows/follows.module';
import { FeedModule } from './feed/feed.module';
import { ShowcaseModule } from './showcase/showcase.module';
import { ImageCommentsModule } from './image-comments/image-comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    ArticlesModule,
    TagsModule,
    UsersModule,
    UploadModule,
    LikesModule,
    CommentsModule,
    FollowsModule,
    FeedModule,
    ShowcaseModule,
    ImageCommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
