import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from '../email-repo/emailchunk.entity';
import { Repository } from 'typeorm';
import {
  TOP_K,
  MIN_SIMILARITY,
  EMBEDDING_SERVICE_PROVIDER_STRING,
} from '../common/constants';
import { RerankerService } from '../reranker/reranker.service';
import { type IEmbeddingService } from '../ai-embedder/interfaces/IEmbeddingService.interface';
import { EmailRepoService } from '../email-repo/email-repo.service';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);
  constructor(
    private readonly emailRepoService: EmailRepoService,
    @Inject(EMBEDDING_SERVICE_PROVIDER_STRING)
    private readonly embeddingService: IEmbeddingService,
    private readonly rerankerServive: RerankerService,
  ) {}

  async fetchContext(prompt: string, user_id: number): Promise<string[]> {
    const relevantChunks: EmailChunk[] = await this.fetchRelevantChunks(prompt, user_id);

    const seen = new Set<number>();
    const deduplicated = relevantChunks.filter((doc) => {
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    });

    const relevantContextStrings: string[] = deduplicated.map((c) => {
      return c.embedded_text;
    });

    const rerankedContext: string[] = await this.rerankerServive.rerankChunks(
      prompt,
      relevantContextStrings,
    );
    return rerankedContext;
  }

  private async fetchRelevantChunks(prompt: string, user_id: number): Promise<EmailChunk[]> {
    const promptEmbedding: number[] = await this.embeddingService.getEmbedding(
      prompt,
      true,
    );

    if (!promptEmbedding || promptEmbedding.length === 0) {
      this.logger.error('Failed to generate embedding: returned empty array');
      throw new HttpException(
        'Failed to generate embedding: returned empty array',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const results =
      await this.emailRepoService.vectorSimilaritySearch(promptEmbedding, user_id);

    return results;
  }
}
