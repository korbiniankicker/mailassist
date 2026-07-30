import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IEmbeddingService } from './interfaces/IEmbeddingService.interface';

@Injectable()
export class HuggingFaceEmbeddingService implements IEmbeddingService {
  private readonly logger = new Logger(HuggingFaceEmbeddingService.name);

  async getEmbedding(text: string, query: boolean): Promise<number[]> {
    if (!process.env.EMBEDDING_MICROSERVICE_URL) {
      this.logger.error('Error: No Embedding microservice URL provided');
      throw new HttpException(
        'Error: No Embedding microservice URL provided',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
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
        this.logger.error('Error fetching embedding from microservice');
      }
      return data.embedding;
    } catch (error) {
      const message = `Embedding microservice error: ${error instanceof Error ? error.message : error}`;
      this.logger.error(message);
      throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
