import { Injectable } from '@nestjs/common';
import { ILLMService } from './ILLMService.interface';
import { ContextService } from 'src/context/context.service';
import { SYSTEM_PROMPT } from './ai.constants';
import ollama from 'ollama';

@Injectable()
export class OllamaLlmService implements ILLMService {
  constructor(private readonly contextService: ContextService) {}

  async *generateResponse(promt: string): AsyncGenerator<string> {
    const response = await ollama.chat({
      model: 'mistral-3:8b',
      messages: [
        {
          role: 'user',
          content: await this.buildContext(promt),
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
  async buildContext(promt: string): Promise<string> {
    const contextChunks = await this.contextService.fetchContext(promt);
    let context: string = '';

    const today = new Date().getDate();

    contextChunks.forEach((chunk, i) => {
      context += `
        ---Email ${i}---
        From: ${chunk.sender}
        Date: ${chunk.date}
        Subject: ${chunk.subject}
        Content: ${chunk.embeddedText}
        `;
    });

    return SYSTEM_PROMPT(context, today);
  }
}
