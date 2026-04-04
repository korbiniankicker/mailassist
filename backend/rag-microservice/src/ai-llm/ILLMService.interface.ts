import { MessageDto } from 'src/common/messages.dto';

export interface ILLMService {
  generateEmailContextResponse(promt: string): AsyncGenerator<string>;
  generatePromptClassification(prompt: string): Promise<string>;
  generateChatContextResponse(
    prompt: string,
    messages: MessageDto[],
  ): AsyncGenerator<string>;
}
