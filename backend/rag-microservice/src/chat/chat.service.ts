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

  async *generateResponse(
    prompt: string,
    user_id: number,
    conversation_id?: number,
  ): AsyncGenerator<{ response: string; conversation_id: number }> {
    let convo_id: number;
    let chatHistory: MessageDto[] = [];

    if (!conversation_id) {
      convo_id = await this.chatRepoService.createConversation(prompt, user_id);
      chatHistory = [];
    } else {
      const convo = await this.chatRepoService.getConversationById(
        conversation_id,
        user_id,
      );
      convo_id = convo.id;
      chatHistory = await this.chatRepoService.findAll(user_id, convo_id);
    }

    await this.chatRepoService.storeMessage('user', prompt, convo_id);

    yield { response: '', conversation_id: convo_id };

    let res: string = '';
    try {
      for await (let response of this.llmService.generateResponse(
        prompt,
        chatHistory,
        user_id,
      )) {
        res = res + response;
        yield {
          response: response,
          conversation_id: convo_id,
        };
      }
    } finally {
      if (res) {
        await this.chatRepoService.storeMessage('assistant', res, convo_id);
      }
    }
  }
}
