import { Injectable } from '@nestjs/common';
import { IEmbeddingService } from './interfaces/IEmbeddingService.interface';

@Injectable()
export class HuggingFaceEmbeddingService implements IEmbeddingService {
  async getEmbedding(text: string, query: boolean): Promise<number[]> {
    if (!process.env.EMBEDDING_MICROSERVICE_URL) {
      throw 'Error: No Embedding microservice URL provided';
    }
    const response = await fetch(process.env.EMBEDDING_MICROSERVICE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        query: query,
      }),
    });

    const data = await response.json();

    if (!data.embedding) {
      console.error('Error fetching embedding from microservice');
    }
    return data.embedding;
  }
}
