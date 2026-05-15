import { Injectable } from '@nestjs/common';
import { AiRerankerService } from '../ai-reranker/ai-reranker.service';
import { TOP_N } from '../common/constants';

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
    reranking = reranking.slice(0, TOP_N);
    reranking.sort((a, b) => b.score - a.score);
    const context: string[] = reranking.map((r) => {
      return r.text;
    });
    return context;
  }
}
