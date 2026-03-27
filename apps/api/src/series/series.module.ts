import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
