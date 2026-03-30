import { Module } from '@nestjs/common';
import { AiRerankerService } from './ai-reranker.service';

@Module({
  providers: [AiRerankerService],
  exports: [AiRerankerService],
})
export class AiRerankerModule {}
