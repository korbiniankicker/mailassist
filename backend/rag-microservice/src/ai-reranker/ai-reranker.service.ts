import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TOP_N } from '../common/constants';

@Injectable()
export class AiRerankerService {
  private readonly logger = new Logger(AiRerankerService.name);

  async getRanking(
    prompt: string,
    contextChunks: string[],
  ): Promise<{ text: string; score: number }[]> {
    if (!process.env.RERANKING_MICROSERVICE_URL) {
      this.logger.error('Error: No reranking api url provided');
      throw new HttpException(
        'Error: No reranking api url provided',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const response = await fetch(process.env.RERANKING_MICROSERVICE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: prompt,
        documents: contextChunks,
        top_n: TOP_N,
      }),
    });
    if (!response.ok) {
      this.logger.error('Error fetching context reranking: ' + response.status);
      throw new HttpException(
        'Error fetching context reranking: ' + response.status,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const data = await response.json();
    const result: { text: string; score: number }[] = data.results.map(
      (res) => {
        return {
          text: res.document,
          score: res.score,
        };
      },
    );
    return result;
  }
}
