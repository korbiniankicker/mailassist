import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { OllamaService } from 'src/llm-connection/ollama.service';
import { Repository } from 'typeorm';
import { MIN_SIMILARITY } from './context.constants';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    private readonly embeddingService: OllamaService,
    private readonly logger: Logger = new Logger(ContextService.name),
  ) {}

  async fetchContext(promt: string): Promise<number[][]> {
    const promtEmbedding: number[] =
      await this.embeddingService.getEmbedding(promt);
    const response = await this.chunksRepository
      .createQueryBuilder()
      .select('embedding')
      .from(EmailChunk, 'chunk')
      .where('(embedding <=> :promptEmbedding) <= :MIN_SIMILARITY', {
        promtEmbedding: promtEmbedding,
        MIN_SIMILARITY: MIN_SIMILARITY,
      })
      .orderBy('embedding <=> :promtEmbedding')
      .setParameter('promtEmbedding', promtEmbedding)
      .limit(5)
      .getMany();
    let contextVectors: number[][] = [];
    response.forEach((ro) => {
      contextVectors.push(ro.embedding);
    });
    return contextVectors;
  }
}
