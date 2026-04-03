import { Inject, Injectable } from '@nestjs/common';
import { EmailFetcherService } from '../email-fetcher/email-fetcher.service';
import { EmailRepoService } from '../email-repo/email-repo.service';
import {
  CHUNK_SIZE,
  EMBEDDING_SERVICE_PROVIDER_STRING,
  OVERLAP_SIZE,
} from '../common/constants';
import { EmailChunk } from 'src/email-repo/emailchunk.entity';
import { EmailDto } from 'src/common/email.dto';
import { type IEmbeddingService } from 'src/ai-embedder/interfaces/IEmbeddingService.interface';

@Injectable()
export class EmailEmbedderService {
  emailQueue: { message: EmailDto; progress: number }[];
  fetchingComplete: boolean;

  constructor(
    private emailFetcherService: EmailFetcherService,
    private emailStoreService: EmailRepoService,
    @Inject(EMBEDDING_SERVICE_PROVIDER_STRING)
    private readonly ollamaService: IEmbeddingService,
  ) {
    this.emailQueue = [];
    this.fetchingComplete = false;
  }

  private async filterEmails() {
    for await (let email of this.emailFetcherService.getMessages('INBOX')) {
      email.message.content = this.stripContentWhitespaces(
        email.message.content,
      );
      this.emailQueue.push(email);
    }
    this.fetchingComplete = true;
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
    while (!this.fetchingComplete || this.emailQueue.length > 0) {
      if (this.emailQueue.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }
      const mail = this.emailQueue.shift();
      if (!mail) {
        console.warn(
          'Error in mail ingestion pipeline queue: mail object empty',
        );
        continue;
      }
      let buffer = mail.message.content;
      let metadata = `From: ${mail.message.sender} | Date: ${mail.message.date} | Subject: ${mail.message.subject}\n`;
      while (buffer.length > CHUNK_SIZE) {
        const chunk = metadata + `\n${buffer.slice(0, CHUNK_SIZE)}\n`;
        buffer = buffer.slice(CHUNK_SIZE - OVERLAP_SIZE);
        const embedding = await this.ollamaService.getEmbedding(chunk, false);
        yield {
          obj: {
            emailDto: mail.message,
            chunkedText: chunk,
            embedding: embedding,
          },
          progress: mail.progress,
        };
      }
      if (buffer.length > 0) {
        buffer = metadata + `${buffer}\n`;
        const embedding = await this.ollamaService.getEmbedding(buffer, false);
        yield {
          obj: {
            emailDto: mail.message,
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
    this.emailQueue = [];
    this.fetchingComplete = false;

    const filter = this.filterEmails().catch((err) => {
      console.error('Error fetching emails in EmailEmbedderService: ' + err);
      this.fetchingComplete = true;
    });
    for await (let p of this.storeEmailEmbeddings()) {
      yield p;
    }
    await filter;
  }
}
