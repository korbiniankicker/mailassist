import { Injectable } from '@nestjs/common';
import { AiRerankerService } from 'src/ai-reranker/ai-reranker.service';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { MAX_CONTEXT_CHUNKS } from '../common/constants';

@Injectable()
export class RerankerService {
  constructor(private readonly aiRerankerService: AiRerankerService) {}
  async rerankChunks(
    prompt: string,
    contextChunks: EmailChunk[],
  ): Promise<EmailChunk[]> {
    let chunksDict: { chunk: EmailChunk; score: number }[] = [];
    contextChunks.forEach(async (ctx) => {
      const response: number = await this.aiRerankerService.getChunkRanking(
        prompt,
        ctx.embeddedText,
      );
      chunksDict.push({ chunk: ctx, score: response });
    });
    chunksDict.sort((a, b) => b.score - a.score);
    return chunksDict.slice(0, MAX_CONTEXT_CHUNKS).map((c) => c.chunk);
  }
}
