import { HttpException, Injectable, Logger } from '@nestjs/common';
import { IEmbeddingService } from './IEmbeddingService.interface';

@Injectable()
export class OllamaEmbeddingService implements IEmbeddingService {
  constructor(
    private readonly logger = new Logger(OllamaEmbeddingService.name),
  ) {}

  async getEmbedding(text: string): Promise<number[]> {
    let response = await fetch(String(process.env.OLLAMA_URL_EMBED), {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text',
        input: text,
      }),
    });
    if (!response.ok) {
      this.logger.error('Ollama request failed');
      throw new HttpException(
        `Ollama request failed with status ${response.status}`,
        response.status,
      );
    }
    const data = await response.json();
    return data.embeddings;
  }
}
