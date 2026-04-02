import { Injectable } from '@nestjs/common';
import { AiRerankerService } from 'src/ai-reranker/ai-reranker.service';
import { EmailChunk } from 'src/email-repo/emailchunk.entity';
import { MAX_CONTEXT_CHUNKS } from '../common/constants';

@Injectable()
export class RerankerService {
  constructor(private readonly aiRerankerService: AiRerankerService) {}

  async rerankChunks(
    prompt: string,
    contextChunks: string[],
  ): Promise<string[]> {
    let reranking = await this.aiRerankerService.getRanking(
      prompt,
      contextChunks,
    );
    reranking.sort((a, b) => b.score - a.score);
    const context: string[] = reranking.map((r) => {
      return r.text;
    });
    return context;
  }
}
