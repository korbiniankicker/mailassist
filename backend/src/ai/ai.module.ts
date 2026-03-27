import { Module } from '@nestjs/common';
import { OllamaEmbeddingService } from './ollama-embedding.service';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [ContextModule],
  providers: [OllamaEmbeddingService],
  exports: [OllamaEmbeddingService],
})
export class AiModule {}
