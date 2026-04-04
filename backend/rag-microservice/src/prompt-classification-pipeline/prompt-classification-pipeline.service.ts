import { Injectable } from '@nestjs/common';
import { OllamaLlmService } from 'src/ai-llm/ollama-llm.service';
import { QUERY_TYPE } from 'src/common/constants';
import { MessageDto } from 'src/common/messages.dto';

@Injectable()
export class PromptClassificationPipelineService {
  constructor(private readonly ollamaService: OllamaLlmService) {}

  async *generateResponse(
    prompt: string,
    messages: MessageDto[],
  ): AsyncGenerator<string> {
    const classification: QUERY_TYPE =
      await this.ollamaService.generatePromptClassification(prompt);

    switch (classification) {
      case QUERY_TYPE.EMAIL_QUERY:
        for await (let res of this.ollamaService.generateEmailContextResponse(
          prompt,
          messages,
        )) {
          yield res;
        }
        return;
      case QUERY_TYPE.CONVERSATION_QUERY:
        for await (let res of this.ollamaService.generateChatContextResponse(
          prompt,
          messages,
        )) {
          yield res;
        }
        return;
      default:
        return 'NOT IMPLEMENTED YET';
    }
  }
}
