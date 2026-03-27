import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { OllamaEmbeddingService } from 'src/ai-embedder/ollama-embedding.service';
import { Repository } from 'typeorm';
import { MAX_CONTEXT_CHUNKS, MIN_SIMILARITY } from './context.constants';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    private readonly embeddingService: OllamaEmbeddingService,
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
      [JSON.stringify(promptEmbedding), MIN_SIMILARITY, MAX_CONTEXT_CHUNKS],
    );

    return results;
  }
}
