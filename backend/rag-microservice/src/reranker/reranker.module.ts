import { Module } from '@nestjs/common';
import { RerankerService } from './reranker.service';
import { AiRerankerModule } from '../ai-reranker/ai-reranker.module';

@Module({
  imports: [AiRerankerModule],
  providers: [RerankerService],
  exports: [RerankerService],
})
export class RerankerModule {}
