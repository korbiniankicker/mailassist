import { Module } from '@nestjs/common';
import { OllamaEmbeddingService } from './ollama-embedding.service';
import { HuggingFaceEmbeddingService } from './huggingFace-embedding.service';
import { EmbeddingProvider } from './embedder.provider';
import { EMBEDDING_SERVICE_PROVIDER_STRING } from 'src/common/constants';

@Module({
  providers: [
    OllamaEmbeddingService,
    HuggingFaceEmbeddingService,
    EmbeddingProvider,
  ],
  exports: [EMBEDDING_SERVICE_PROVIDER_STRING],
})
export class AiEmbedderModule {}
