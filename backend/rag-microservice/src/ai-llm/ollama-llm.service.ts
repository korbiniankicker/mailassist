import { Injectable, NotImplementedException } from '@nestjs/common';
import { ILLMService } from './ILLMService.interface';
import { ContextService } from 'src/context/context.service';
import {
  LLM_MODEL,
  QUERY_TYPE,
  SYSTEM_PROMPT_EMAIL_CONTEXT,
  SYSTEM_PROMPT_CLASSIFICATION,
  SYSTEM_PROMPT_CHAT_CONTEXT,
} from '../common/constants';
import { Message, Ollama } from 'ollama';
import { MessageDto } from 'src/common/messages.dto';
import { SqlParamsDto } from 'src/common/sqlParams.dto';

@Injectable()
export class OllamaLlmService implements ILLMService {
  private ollama: Ollama;
  constructor(private readonly contextService: ContextService) {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }

  async *generateEmailContextResponse(
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
        {
          role: 'system',
          content: await this.buildContext(prompt),
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
        yield res.message.content;
      }
    }
  }
  async buildContext(prompt: string): Promise<string> {
    const contextChunks = await this.contextService.fetchContext(prompt);

    const context = contextChunks.join('\n');
    const today = new Date().toLocaleString();

    console.log(
      'final content: \n' + SYSTEM_PROMPT_EMAIL_CONTEXT(context, today),
    );
    return SYSTEM_PROMPT_EMAIL_CONTEXT(context, today);
  }

  async generatePromptClassification(prompt: string): Promise<QUERY_TYPE> {
    const response = await this.ollama.chat({
      model: LLM_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT_CLASSIFICATION,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      format: {
        type: 'object',
        properties: {
          intent: {
            type: 'string',
            enum: Object.values(QUERY_TYPE),
          },
        },
        required: ['intent'],
      },
    });
    const { intent } = JSON.parse(response.message.content);
    return intent as QUERY_TYPE;
  }
  async *generateChatContextResponse(
    prompt: string,
    messages: MessageDto[],
  ): AsyncGenerator<string> {
    console.log(messages);
    const response = await this.ollama.chat({
      model: LLM_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT_CHAT_CONTEXT,
        },
        ...(messages ?? []),
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

  async generateSqlQueryParams(prompt: string): Promise<SqlParamsDto> {
    //TODO
    throw NotImplementedException;
  }
}
