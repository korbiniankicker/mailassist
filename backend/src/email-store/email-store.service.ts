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

  async storeChunk(
    _sender: string,
    _date: Date,
    _embeddedText: string,
    _embedding: number[],
  ): Promise<EmailChunk | null> {
    try {
      const _chunk: EmailChunk = this.chunksRepository.create({
        sender: _sender,
        date: _date,
        embeddedText: _embeddedText,
        embedding: _embedding,
      });
      return await this.chunksRepository.save(_chunk);
    } catch (error) {
      this.logger.error('Database connection failed');
      throw error;
    }
  }
}
