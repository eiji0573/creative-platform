import { Module } from '@nestjs/common';
import { ImageCommentsController } from './image-comments.controller';
import { ImageCommentsService } from './image-comments.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ImageCommentsController],
  providers: [ImageCommentsService],
})
export class ImageCommentsModule {}
