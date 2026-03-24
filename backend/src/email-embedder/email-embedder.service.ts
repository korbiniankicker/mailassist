import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmailFetcherService } from '../email-fetcher/email-fetcher.service';
import { OllamaEmbeddingService } from '../ai/ollama-embedding.service';
import { EmailStoreService } from '../email-store/email-store.service';
import { CHUNK_SIZE, OVERLAP_SIZE } from './embedding.constants';
import { warn } from 'console';

@Injectable()
export class EmailEmbedderService {
  constructor(
    private emailFetcherService: EmailFetcherService,
    private emailStoreService: EmailStoreService,
    private ollamaService: OllamaEmbeddingService,
    private readonly logger: Logger = new Logger(EmailEmbedderService.name),
  ) {}

  async *filterEmails(): AsyncGenerator<{
    sender: string;
    content: string;
    date: Date;
  }> {
    for await (let message of this.emailFetcherService.getMessages('INBOX')) {
      const sender: string | undefined =
        message.envelope?.sender?.toString() ?? undefined;
      const message_content: string | undefined =
        message.source?.toString() ?? undefined;
      const date: Date | undefined = message.envelope?.date ?? undefined;
      if (!sender || !message_content || !date) {
        Logger.warn(
          'Unable to fully fetch Email information. E-Mail has been skipped, conituning to next E-Mal',
        );
        continue;
      }
      yield { sender: sender, content: message_content, date: date };
    }
  }

  async *chunkEmails(): AsyncGenerator<{
    embeddedText: string;
    date: Date;
    embedding: number[];
    sender: string;
  }> {
    for await (const mail of this.filterEmails()) {
      let buffer = `Sent by: ${mail.sender}\n${mail.content}`;
      while (buffer.length > CHUNK_SIZE + OVERLAP_SIZE * 2) {
        const chunk = buffer.slice(0, CHUNK_SIZE + OVERLAP_SIZE * 2);
        buffer = buffer.slice(CHUNK_SIZE + OVERLAP_SIZE);
        const embedding = await this.ollamaService.getEmbedding(chunk);
        yield {
          embeddedText: chunk,
          date: mail.date,
          embedding: embedding,
          sender: mail.sender,
        };
      }
      if (buffer.length > 0) {
        const embedding = await this.ollamaService.getEmbedding(buffer);
        yield {
          embeddedText: buffer,
          date: mail.date,
          embedding: embedding,
          sender: mail.sender,
        };
      }
    }
  }
  async storeEmailEmbeddings() {
    for await (let chunk of this.chunkEmails()) {
      this.emailStoreService.storeChunk(
        chunk.sender,
        chunk.date,
        chunk.embeddedText,
        chunk.embedding,
      );
    }
  }
  async embedEmails() {
    await this.storeEmailEmbeddings();
  }
}
