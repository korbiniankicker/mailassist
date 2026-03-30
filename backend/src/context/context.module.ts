import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { AiEmbedderModule } from 'src/ai-embedder/ai-embedder.module';
import { EmailStoreModule } from 'src/email-store/email-store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { RerankerModule } from 'src/reranker/reranker.module';

@Module({
  providers: [ContextService],
  imports: [
    TypeOrmModule.forFeature([EmailChunk]),
    AiEmbedderModule,
    EmailStoreModule,
    RerankerModule,
  ],
  exports: [ContextService],
})
export class ContextModule {}
