import { Injectable } from '@nestjs/common';
import { EmailFetcherService } from '../email-fetcher/email-fetcher.service';
import { OllamaService } from './ollama.service';
import { EmailStoreService } from '../email-store/email-store.service';
import { CHUNK_SIZE, OVERLAP_SIZE } from './embedding_constants.constants';

@Injectable()
export class EmailEmbedderService {
  constructor(
    private emailFetcherService: EmailFetcherService,
    private emailStoreService: EmailStoreService,
    private ollamaService: OllamaService,
  ) {}

  async *filterEmails(): AsyncGenerator<{ sender: string; content: string }> {
    for await (let message of this.emailFetcherService.getMessages('INBOX')) {
      const sender: string = message.envelope?.sender?.toString() ?? '';
      const message_content: string = message.source?.toString() ?? '';
      yield { sender: sender, content: message_content };
    }
  }

  async *chunkEmails(): AsyncGenerator<{
    embedding: number[];
    sender: string;
  }> {
    for await (const mail of this.filterEmails()) {
      let buffer = `Sent by: ${mail.sender}\n${mail.content}`;
      while (buffer.length > CHUNK_SIZE + OVERLAP_SIZE * 2) {
        const chunk = buffer.slice(0, CHUNK_SIZE + OVERLAP_SIZE * 2);
        buffer = buffer.slice(CHUNK_SIZE + OVERLAP_SIZE);
        const embedding = await this.ollamaService.getEmbedding(chunk);
        yield { embedding: embedding, sender: mail.sender };
      }
      if (buffer.length > 0) {
        const embedding = await this.ollamaService.getEmbedding(buffer);
        yield { embedding, sender: mail.sender };
      }
    }
  }
  async storeEmailEmbeddings() {
    for await (let chunk of this.chunkEmails()) {
      this.emailStoreService.storeChunk(chunk.sender, chunk.embedding);
    }
  }
  async embedEmails() {
    await this.storeEmailEmbeddings();
  }
}
