import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-repo/emailchunk.entity';
import { OllamaEmbeddingService } from 'src/ai-embedder/ollama-embedding.service';
import { Repository } from 'typeorm';
import { TOP_K, MIN_SIMILARITY } from '../common/constants';
import { RerankerService } from 'src/reranker/reranker.service';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    private readonly embeddingService: OllamaEmbeddingService,
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

    const relevantContextStrings: string[] = this.buildContext(deduplicated);

    const rerankedContext: string[] = await this.rerankerServive.rerankChunks(
      prompt,
      relevantContextStrings,
    );
    return rerankedContext;
  }

  private async fetchRelevantChunks(prompt: string): Promise<EmailChunk[]> {
    const promptEmbedding: number[] = await this.embeddingService.getEmbedding(
      'search_query: ' + prompt,
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
  private buildContext(contextChunks: EmailChunk[]): string[] {
    const context: string[] = contextChunks.map((chunk) => {
      return `
          ---Email---
          From: ${chunk.sender}
          Date: ${chunk.date}
          Subject: ${chunk.subject}
          Content: ${chunk.embedded_text}
          `;
    });
    return context;
  }
}
