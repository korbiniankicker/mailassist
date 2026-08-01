import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ILLMService } from './ILLMService.interface';
import { ContextService } from '../context/context.service';
import { LLM_MODEL, SYSTEM_PROMPT } from '../common/constants';
import { Message, Ollama } from 'ollama';
import { MessageDto } from '../common/dto/messages.dto';

@Injectable()
export class OllamaLlmService implements ILLMService {
  private ollama: Ollama;
  private readonly logger = new Logger(OllamaLlmService.name);
  constructor(private readonly contextService: ContextService) {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }

  async *generateResponse(
    prompt: string,
    messages?: MessageDto[],
    user_id?: number,
  ): AsyncGenerator<string> {
    const pastMessages: Message[] =
      messages?.map((m) => ({
        role: m.role,
        content: m.content,
      })) ?? [];

    let produced = false;
    try {
      const response = await this.ollama.chat({
        model: LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: await this.buildContext(prompt, user_id),
          },
          ...(pastMessages ?? []),
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      for await (let res of response) {
        if (res.message.content) {
          produced = true;
          yield res.message.content;
        }
      }

      if (!produced) {
        throw new Error('Ollama returned an empty response');
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Ollama server at ${process.env.OLLAMA_URL} did not respond correctly: ${detail}`,
      );
      throw new InternalServerErrorException(
        'The AI service is temporarily unavailable. Please try again later.',
      );
    }
  }
  async buildContext(prompt: string, user_id?: number): Promise<string> {
    const contextChunks = await this.contextService.fetchContext(prompt, user_id!);

    const context = contextChunks.join('\n');
    const today = new Date().toLocaleString();

    if (process.env.NODE_ENV == 'development') {
      this.logger.log('Final content: ' + SYSTEM_PROMPT(context, today));
    }

    return SYSTEM_PROMPT(context, today);
  }
}
