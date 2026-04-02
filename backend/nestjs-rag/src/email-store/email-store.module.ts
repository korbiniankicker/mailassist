import { Module } from '@nestjs/common';
import { EmailStoreService } from './email-store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailChunk])],
  providers: [EmailStoreService],
  exports: [EmailStoreService],
})
export class EmailStoreModule {}
