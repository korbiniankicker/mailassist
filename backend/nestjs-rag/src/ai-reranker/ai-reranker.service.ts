import { Injectable } from '@nestjs/common';
import { TOP_N } from 'src/common/constants';

@Injectable()
export class AiRerankerService {
  async getRanking(
    prompt: string,
    contextChunks: string[],
  ): Promise<{ text: string; score: number }[]> {
    if (!process.env.RERANKING_MICROSERVICE_URL) {
      throw 'Error: No reranking api url provided';
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
      throw 'Error fetching context reranking: ' + response.status;
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
