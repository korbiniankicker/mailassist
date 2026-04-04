import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-repo/emailchunk.entity';
import { Repository } from 'typeorm';
import {
  TOP_K,
  MIN_SIMILARITY,
  EMBEDDING_SERVICE_PROVIDER_STRING,
} from '../common/constants';
import { RerankerService } from 'src/reranker/reranker.service';
import { type IEmbeddingService } from 'src/ai-embedder/interfaces/IEmbeddingService.interface';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    @Inject(EMBEDDING_SERVICE_PROVIDER_STRING)
    private readonly embeddingService: IEmbeddingService,
    private readonly rerankerServive: RerankerService,
  ) {}

  async fetchContext(prompt: string): Promise<string[]> {
    const relevantChunks: EmailChunk[] = await this.fetchRelevantChunks(prompt);

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

  private async fetchRelevantChunks(prompt: string): Promise<EmailChunk[]> {
    const promptEmbedding: number[] = await this.embeddingService.getEmbedding(
      prompt,
      true,
    );

    if (!promptEmbedding || promptEmbedding.length === 0) {
      throw new Error('Failed to generate embedding: returned empty array');
    }

    const results = await this.chunksRepository.query(
      `
    SELECT *, 1 - (embedding <=> $1::vector) AS similarity
    FROM email_chunk
    WHERE 1 - (embedding <=> $1::vector) >= $2
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $3
  `,
      [JSON.stringify(promptEmbedding), MIN_SIMILARITY, TOP_K],
    );

    console.log('---------Vector similarities--------------');
    results.forEach((r) => console.log(r.subject, r.similarity));

    return results;
  }
}
