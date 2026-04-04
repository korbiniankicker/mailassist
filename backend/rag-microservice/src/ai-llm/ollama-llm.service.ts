import { Injectable } from '@nestjs/common';
import { ILLMService } from './ILLMService.interface';
import { ContextService } from 'src/context/context.service';
import { LLM_MODEL, SYSTEM_PROMPT } from '../common/constants';
import { Message, Ollama } from 'ollama';
import { MessageDto } from 'src/common/messages.dto';

@Injectable()
export class OllamaLlmService implements ILLMService {
  private ollama: Ollama;
  constructor(private readonly contextService: ContextService) {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }

  async *generateResponse(
    prompt: string,
    messages?: MessageDto[],
  ): AsyncGenerator<string> {
    const pastMessages: Message[] =
      messages?.map((m) => ({
        role: m.role,
        content: m.content,
      })) ?? [];
    const response = await this.ollama.chat({
      model: LLM_MODEL,
      messages: [
        ...(pastMessages ?? []),
        {
          role: 'system',
          content: await this.buildContext(prompt),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    for await (let res of response) {
      if (res.message.content) {
        yield res.message.content;
      }
    }
  }
  async buildContext(prompt: string): Promise<string> {
    const contextChunks = await this.contextService.fetchContext(prompt);

    const context = contextChunks.join('\n');
    const today = new Date().toLocaleString();

    console.log('final content: ' + SYSTEM_PROMPT(context, today));
    return SYSTEM_PROMPT(context, today);
  }
}
