import { Injectable } from '@nestjs/common';
import { ILLMService } from './ILLMService.interface';

@Injectable()
export class OllamaLLmService implements ILLMService {
  async *generatePromt(promt: string): AsyncGenerator<string> {
    const response = await fetch(String(process.env.OLLAMA_URL_EMBED), {
      method: 'POST',
      body: JSON.stringify({
        model: 'mistral-3:8b',
        messages: [],
      }),
    });
  }
}
