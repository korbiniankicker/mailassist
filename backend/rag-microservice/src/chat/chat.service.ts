import { Injectable } from '@nestjs/common';
import { OllamaLlmService } from '../ai-llm/ollama-llm.service';
import { ChatRepoService } from '../chat-repo/chat-repo.service';
import { MessageDto } from '../common/dto/messages.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: OllamaLlmService,
    private readonly chatRepoService: ChatRepoService,
  ) {}

  chatHistory: MessageDto[] = [];

  async *generateResponse(prompt: string): AsyncGenerator<string> {
    if (this.chatHistory.length === 0) {
      this.chatHistory = await this.chatRepoService.findAll();
    }
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
    await this.chatRepoService.storeMessage('user', prompt);
    await this.chatRepoService.storeMessage('assistant', res);
  }
}
