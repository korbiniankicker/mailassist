import { Injectable } from '@nestjs/common';
import { EmailFetcherService } from '../email-fetcher/email-fetcher.service';
import { OllamaEmbeddingService } from '../ai-embedder/ollama-embedding.service';
import { EmailStoreService } from '../email-store/email-store.service';
import { CHUNK_SIZE, OVERLAP_SIZE } from './embedding.constants';
import { EmailChunk } from 'src/email-store/emailchunk.entity';

@Injectable()
export class EmailEmbedderService {
  constructor(
    private emailFetcherService: EmailFetcherService,
    private emailStoreService: EmailStoreService,
    private ollamaService: OllamaEmbeddingService,
  ) {}

  async *filterEmails(): AsyncGenerator<{
    sender: string;
    content: string;
    subject: string;
    date: Date;
  }> {
    for await (let message of this.emailFetcherService.getMessages('INBOX')) {
      const sender: string | undefined =
        message.envelope?.sender?.toString() ?? undefined;
      const message_content: string | undefined =
        message.source?.toString() ?? undefined;
      const date: Date | undefined = message.envelope?.date ?? undefined;
      const subject: string | undefined =
        message.envelope?.subject ?? undefined;
      if (!sender || !message_content || !date || !subject) {
        //Logger.warn(
        //  'Unable to fully fetch Email information. E-Mail has been skipped, conituning to next E-Mal',
        //);
        continue;
      }
      yield {
        sender: sender,
        content: message_content,
        subject: subject,
        date: date,
      };
    }
  }

  async *chunkEmails(): AsyncGenerator<{
    embeddedText: string;
    date: Date;
    embedding: number[];
    sender: string;
    subject: string;
  }> {
    for await (const mail of this.filterEmails()) {
      let buffer = `From: ${mail.sender}\n
                    Date: ${mail.date}\n
                    Subject: ${mail.subject}\n
                    Content: ${mail.content}`;
      while (buffer.length > CHUNK_SIZE + OVERLAP_SIZE * 2) {
        const chunk = buffer.slice(0, CHUNK_SIZE + OVERLAP_SIZE * 2);
        buffer = buffer.slice(CHUNK_SIZE + OVERLAP_SIZE);
        const embedding = await this.ollamaService.getEmbedding(chunk);
        yield {
          embeddedText: chunk,
          date: mail.date,
          embedding: embedding,
          sender: mail.sender,
          subject: mail.subject,
        };
      }
      if (buffer.length > 0) {
        const embedding = await this.ollamaService.getEmbedding(buffer);
        yield {
          embeddedText: buffer,
          date: mail.date,
          embedding: embedding,
          sender: mail.sender,
          subject: mail.subject,
        };
      }
    }
  }
  async storeEmailEmbeddings() {
    for await (let chunk of this.chunkEmails()) {
      this.emailStoreService.storeChunk(chunk as EmailChunk);
    }
  }
  async embedEmails() {
    await this.storeEmailEmbeddings();
  }
}
