import { Injectable } from '@nestjs/common';
import { EmailFetcherService } from '../email-fetcher/email-fetcher.service';
import { OllamaEmbeddingService } from '../ai-embedder/ollama-embedding.service';
import { EmailStoreService } from '../email-store/email-store.service';
import { CHUNK_SIZE, OVERLAP_SIZE } from '../common/constants';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { EmailDto } from 'src/common/email.dto';

@Injectable()
export class EmailEmbedderService {
  constructor(
    private emailFetcherService: EmailFetcherService,
    private emailStoreService: EmailStoreService,
    private ollamaService: OllamaEmbeddingService,
  ) {}

  private async *filterEmails(): AsyncGenerator<{
    emailDto: EmailDto;
    progress: number;
  }> {
    for await (let email of this.emailFetcherService.getMessages('INBOX')) {
      email.message.content = this.stripContentWhitespaces(
        email.message.content,
      );
      yield {
        emailDto: email.message,
        progress: email.progress,
      };
    }
  }

  private stripContentWhitespaces(content: string): string {
    const pattern = /^\s*[\r\n]/gm;
    return content.replace(pattern, '');
  }

  private async *chunkEmails(): AsyncGenerator<{
    obj: {
      emailDto: EmailDto;
      chunkedText: string;
      embedding: number[];
    };
    progress: number;
  }> {
    for await (const mail of this.filterEmails()) {
      let buffer = mail.emailDto.content;
      let metadata = `From: ${mail.emailDto.sender} | Date: ${mail.emailDto.date} | Subject: ${mail.emailDto.subject}\n`;
      while (buffer.length > CHUNK_SIZE) {
        const chunk = metadata + `\n${buffer.slice(0, CHUNK_SIZE)}\n`;
        buffer = buffer.slice(CHUNK_SIZE - OVERLAP_SIZE);
        const embedding = await this.ollamaService.getEmbedding(
          'search_document: ' + chunk,
        );
        yield {
          obj: {
            emailDto: mail.emailDto,
            chunkedText: chunk,
            embedding: embedding,
          },
          progress: mail.progress,
        };
      }
      if (buffer.length > 0) {
        buffer = metadata + `${buffer}\n`;
        const embedding = await this.ollamaService.getEmbedding(
          'search_document: ' + buffer,
        );
        yield {
          obj: {
            emailDto: mail.emailDto,
            chunkedText: buffer,
            embedding: embedding,
          },
          progress: mail.progress,
        };
      }
    }
  }
  private async *storeEmailEmbeddings(): AsyncGenerator<number> {
    for await (let chunk of this.chunkEmails()) {
      let emailChunk: EmailChunk = {
        date: chunk.obj.emailDto.date,
        embedding: chunk.obj.embedding,
        embedded_text: chunk.obj.chunkedText,
        sender: chunk.obj.emailDto.sender,
        subject: chunk.obj.emailDto.subject,
        message_id: chunk.obj.emailDto.messageId,
      } as EmailChunk;
      await this.emailStoreService.storeChunk(emailChunk);
      yield chunk.progress;
    }
  }
  async *embedEmails(): AsyncGenerator<number> {
    for await (let p of this.storeEmailEmbeddings()) {
      yield p;
    }
  }
}
