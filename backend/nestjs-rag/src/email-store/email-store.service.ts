import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailStoreService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
  ) {}

  async storeChunk(emailChunk: EmailChunk): Promise<EmailChunk | null> {
    try {
      const _chunk: EmailChunk = this.chunksRepository.create({
        subject: emailChunk.subject,
        sender: emailChunk.sender,
        date: emailChunk.date,
        embedded_text: emailChunk.embedded_text,
        message_id: emailChunk.message_id,
        embedding: emailChunk.embedding,
      });
      return await this.chunksRepository.save(_chunk);
    } catch (error) {
      throw error;
    }
  }
}
