import { Injectable } from '@nestjs/common';
import { ILLMService } from './ILLMService.interface';
import { ContextService } from 'src/context/context.service';
import { SYSTEM_PROMPT } from './ai.constants';
import { Ollama } from 'ollama';

@Injectable()
export class OllamaLlmService implements ILLMService {
  private ollama: Ollama;
  constructor(private readonly contextService: ContextService) {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }

  async *generateResponse(prompt: string): AsyncGenerator<string> {
    const response = await this.ollama.chat({
      model: 'mistral:7b',
      messages: [
        {
          role: 'user',
          content: await this.buildContext(prompt),
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

    console.log('final content: ' + SYSTEM_PROMPT(context, today));
    return SYSTEM_PROMPT(context, today);
  }
}
