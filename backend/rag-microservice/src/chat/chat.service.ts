import { Injectable } from '@nestjs/common';
import { ILLMService } from 'src/ai-llm/ILLMService.interface';
import { OllamaLlmService } from 'src/ai-llm/ollama-llm.service';
import { MessageDto } from 'src/common/messages.dto';

@Injectable()
export class ChatService {
  constructor(private readonly llmService: OllamaLlmService) {}

  chatHistory: MessageDto[] = [];

  async *generateResponse(prompt: string): AsyncGenerator<string> {
    let res: string = '';
    for await (let response of this.llmService.generateResponse(
      prompt,
      this.chatHistory,
    )) {
      res = res + response;
      yield response;
    }
    this.chatHistory.push({ role: 'user', content: prompt });
    this.chatHistory.push({ role: 'assistant', content: res });
  }
}
