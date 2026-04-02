import { Injectable } from '@nestjs/common';
import { ILLMService } from 'src/ai-llm/ILLMService.interface';
import { OllamaLlmService } from 'src/ai-llm/ollama-llm.service';

@Injectable()
export class ChatService {
  constructor(private readonly llmService: OllamaLlmService) {}

  async *generateResponse(prompt: string): AsyncGenerator<string> {
    for await (let response of this.llmService.generateResponse(prompt)) {
      yield response;
    }
  }
}
