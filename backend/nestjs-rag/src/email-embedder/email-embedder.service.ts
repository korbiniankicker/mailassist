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
      if (
        !email.message.sender ||
        !email.message.content ||
        !email.message.date ||
        !email.message.subject
      ) {
        console.log(
          'unable to fully fetch email: (DATE)' +
            email.message.date +
            ': (SUBJECT)' +
            email.message.subject +
            ': (SENDER)' +
            email.message.sender +
            ': (CONTENT)' +
            email.message.content,
        );
        continue;
      }
      email.message.content = this.stripContent(email.message.content);
      yield {
        emailDto: email.message,
        progress: email.progress,
      };
    }
  }

  private stripContent(content: string): string {
    const pattern = /^\s*[\r\n]/gm;
    return content.replace(pattern, '');
  }

  private async *chunkEmails(): AsyncGenerator<{
    obj: {
      emailDto: EmailDto;
      embedding: number[];
    };
    progress: number;
  }> {
    for await (const mail of this.filterEmails()) {
      let buffer = `From: ${mail.emailDto.sender}\n
                    Date: ${mail.emailDto.date}\n
                    Subject: ${mail.emailDto.subject}\n
                    Content: ${mail.emailDto.content}`;
      while (buffer.length > CHUNK_SIZE + OVERLAP_SIZE * 2) {
        const chunk = buffer.slice(0, CHUNK_SIZE + OVERLAP_SIZE * 2);
        buffer = buffer.slice(CHUNK_SIZE + OVERLAP_SIZE);
        const embedding = await this.ollamaService.getEmbedding(
          'search_document :' + chunk,
        );
        yield {
          obj: {
            emailDto: mail.emailDto,
            embedding: embedding,
          },
          progress: mail.progress,
        };
      }
      if (buffer.length > 0) {
        const embedding = await this.ollamaService.getEmbedding(buffer);
        yield {
          obj: {
            emailDto: mail.emailDto,
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
        date: chunk.obj.emailDto.date ?? new Date(),
        embedding: chunk.obj.embedding,
        embeddedText: chunk.obj.emailDto.content ?? ' ',
        sender: chunk.obj.emailDto.sender ?? ' ',
        subject: chunk.obj.emailDto.subject ?? ' ',
      } as EmailChunk;
      this.emailStoreService.storeChunk(emailChunk);
      yield chunk.progress;
    }
  }
  async *embedEmails(): AsyncGenerator<number> {
    for await (let p of this.storeEmailEmbeddings()) {
      yield p;
    }
  }
}
