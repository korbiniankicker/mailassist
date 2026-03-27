import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailStoreService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    private readonly logger: Logger = new Logger(EmailStoreService.name),
  ) {}

  async storeChunk(emailChunk: EmailChunk): Promise<EmailChunk | null> {
    try {
      const _chunk: EmailChunk = this.chunksRepository.create({
        subject: emailChunk.subject ?? '',
        sender: emailChunk.sender ?? '',
        date: emailChunk.date ?? '',
        embeddedText: emailChunk.embeddedText ?? '',
        embedding: emailChunk.embedding ?? [],
      });
      return await this.chunksRepository.save(_chunk);
    } catch (error) {
      this.logger.error('Database connection failed');
      throw error;
    }
  }
}
