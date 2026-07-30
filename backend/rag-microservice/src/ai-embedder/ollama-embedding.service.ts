import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IEmbeddingService } from './interfaces/IEmbeddingService.interface';
import { Ollama } from 'ollama';

@Injectable()
export class OllamaEmbeddingService implements IEmbeddingService {
  private ollama: Ollama;
  private readonly logger = new Logger(OllamaEmbeddingService.name);
  constructor() {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }

  async getEmbedding(text: string, query: boolean): Promise<number[]> {
    try {
      text = query ? 'search_query: ' + text : 'search_document: ' + text;
      const response = await this.ollama.embed({
        model: 'nomic-embed-text',
        input: text,
      });

      if (!response.embeddings || response.embeddings.length === 0) {
        throw new HttpException(
          'Empty embeddings returned by ollama',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return response.embeddings[0];
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = `Ollama embedding error: ${error instanceof Error ? error.message : error}`;
      this.logger.error(message);
      throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
