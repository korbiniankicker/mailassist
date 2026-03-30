import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { OllamaEmbeddingService } from 'src/ai-embedder/ollama-embedding.service';
import { Repository } from 'typeorm';
import { TOP_K, MIN_SIMILARITY } from './context.constants';
import { RerankerService } from 'src/reranker/reranker.service';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    private readonly embeddingService: OllamaEmbeddingService,
    private readonly rerankerServive: RerankerService,
  ) {}

  async fetchContext(prompt: string): Promise<EmailChunk[]> {
    const promptEmbedding: number[] =
      await this.embeddingService.getEmbedding(prompt);

    if (!promptEmbedding || promptEmbedding.length === 0) {
      throw new Error('Failed to generate embedding — returned empty array');
    }

    const results: EmailChunk[] = await this.chunksRepository.query(
      `
        SELECT *
        FROM email_chunk
        WHERE 1 - (embedding <=> $1::vector) >= $2
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $3
        `,
      [JSON.stringify(promptEmbedding), MIN_SIMILARITY, TOP_K],
    );
    const resultsTest = await this.chunksRepository.query(
      `
    SELECT *, 1 - (embedding <=> $1::vector) AS similarity
    FROM email_chunk
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $2
  `,
      [JSON.stringify(promptEmbedding), TOP_K],
    );
    console.log(
      resultsTest.map((r) => ({
        id: r.id,
        similarity: r.similarity,
        preview: r.embeddedText.slice(0, 80),
      })),
    );
    const rerankedContext = await this.rerankerServive.rerankChunks(
      prompt,
      results,
    );
    return rerankedContext;
  }
}
