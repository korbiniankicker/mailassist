import { Injectable } from '@nestjs/common';
import { Ollama } from 'ollama';
import { RERANKING_MODEL, RERANKING_SYSTEM_PROMPT } from '../common/constants';

@Injectable()
export class AiRerankerService {
  private ollama: Ollama;
  constructor() {
    this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
  }
  async getChunkRanking(prompt: string, contextChunk: string) {
    let response = await this.ollama.chat({
      model: RERANKING_MODEL,
      messages: [
        {
          role: 'system',
          content:
            RERANKING_SYSTEM_PROMPT +
            `\nPrompt: ${prompt}` +
            `\nChunk: ${contextChunk}`,
        },
      ],
      format: {
        type: 'object',
        properties: {
          score: {
            type: 'number',
            minimum: 0,
            maximum: 1,
          },
        },
        required: ['score'],
      },
    });
    let responseJson = JSON.parse(response.message.content);
    if (!responseJson.score) {
      console.log('Error: Unable to parse reranking model response to JSON');
      throw 'Error: unable to parse JSON';
    }
    return responseJson.score;
  }
}
