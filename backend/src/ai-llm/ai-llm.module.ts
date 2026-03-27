import { Module } from '@nestjs/common';
import { OllamaEmbeddingService } from '../ai-embedder/ollama-embedding.service';
import { OllamaLlmService } from './ollama-llm.service';

@Module({
  providers: [OllamaEmbeddingService],
  exports: [OllamaLlmService],
})
export class AiLlmModule {}
