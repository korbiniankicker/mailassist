import { OllamaEmbeddingService } from './ollama-embedding.service';
import { HuggingFaceEmbeddingService } from './huggingFace-embedding.service';
import { FactoryProvider } from '@nestjs/common';
import { IEmbeddingService } from './interfaces/IEmbeddingService.interface';
import { EMBEDDING_SERVICE_PROVIDER_STRING } from 'src/common/constants';

export const EmbeddingProvider: FactoryProvider<IEmbeddingService> = {
  provide: EMBEDDING_SERVICE_PROVIDER_STRING,
  useFactory: (
    ollamaEmbeddingService: OllamaEmbeddingService,
    huggingFaceEmbeddingService: HuggingFaceEmbeddingService,
  ) => {
    return process.env.EMBEDDING_PROVIDER === 'ollama'
      ? ollamaEmbeddingService
      : huggingFaceEmbeddingService;
  },
  inject: [OllamaEmbeddingService, HuggingFaceEmbeddingService],
};
