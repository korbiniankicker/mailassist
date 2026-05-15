import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { AiEmbedderModule } from '../ai-embedder/ai-embedder.module';
import { EmailRepoModule } from '../email-repo/email-repo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from '../email-repo/emailchunk.entity';
import { RerankerModule } from '../reranker/reranker.module';

@Module({
  providers: [ContextService],
  imports: [
    TypeOrmModule.forFeature([EmailChunk]),
    AiEmbedderModule,
    EmailRepoModule,
    RerankerModule,
  ],
  exports: [ContextService],
})
export class ContextModule {}
