import { HttpException, Injectable, Logger } from '@nestjs/common';
import { IEmbeddingService } from './IEmbeddingService.interface';
import { Ollama } from 'ollama';

@Injectable()
export class OllamaEmbeddingService implements IEmbeddingService {
  private ollama: Ollama;
  constructor() {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }

  async getEmbedding(text: string): Promise<number[]> {
    let response = await this.ollama.embed({
      model: 'nomic-embed-text',
      input: text,
    });

    if (response.embeddings.length === 0) {
      console.log('Error: Empty embeddings returned by ollama');
    }

    return response.embeddings[0];
  }
}
