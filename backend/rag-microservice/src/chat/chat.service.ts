import { Injectable } from '@nestjs/common';
import { OllamaLlmService } from 'src/ai-llm/ollama-llm.service';
import { ChatRepoService } from 'src/chat-repo/chat-repo.service';
import { MessageDto } from 'src/common/messages.dto';
import { PromptClassificationPipelineService } from 'src/prompt-classification-pipeline/prompt-classification-pipeline.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly promptClassificationPipelineService: PromptClassificationPipelineService,
    private readonly chatRepoService: ChatRepoService,
  ) {}

  chatHistory: MessageDto[] = [];

  async *generateResponse(prompt: string): AsyncGenerator<string> {
    if (this.chatHistory.length === 0) {
      this.chatHistory = await this.chatRepoService.findAll();
    }
    let res: string = '';
    for await (let response of this.promptClassificationPipelineService.generateResponse(
      prompt,
      this.chatHistory,
    )) {
      res = res + response;
      yield response;
    }
    this.chatHistory.push({ role: 'assistant', content: res } as MessageDto);
    this.chatHistory.push({ role: 'user', content: prompt } as MessageDto);
    await this.chatRepoService.storeMessage('user', prompt);
    await this.chatRepoService.storeMessage('assistant', res);
  }
}
