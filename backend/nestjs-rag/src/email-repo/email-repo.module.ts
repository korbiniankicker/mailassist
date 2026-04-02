import { Module } from '@nestjs/common';
import { EmailRepoService } from './email-repo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailChunk])],
  providers: [EmailRepoService],
  exports: [EmailRepoService],
})
export class EmailRepoModule {}
