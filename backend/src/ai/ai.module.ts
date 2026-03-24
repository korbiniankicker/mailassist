import { Module } from '@nestjs/common';
import { OllamaEmbeddingService } from './ollama-embedding.service';

@Module({
  providers: [OllamaEmbeddingService],
  exports: [OllamaEmbeddingService],
})
export class AiModule {}
