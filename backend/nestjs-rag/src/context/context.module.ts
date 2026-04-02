import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { AiEmbedderModule } from 'src/ai-embedder/ai-embedder.module';
import { EmailRepoModule } from 'src/email-repo/email-repo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-repo/emailchunk.entity';
import { RerankerModule } from 'src/reranker/reranker.module';

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
