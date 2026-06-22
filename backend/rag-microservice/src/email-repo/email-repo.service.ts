import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailRepoService {
  private readonly logger = new Logger(EmailRepoService.name);

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
      this.logger.error('Failed to store email chunk database');
      throw new HttpException(
        'Failed to store email chunk database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllMessageIds(): Promise<string[]> {
    const result = await this.chunksRepository
      .createQueryBuilder('email_chunk')
      .select('DISTINCT email_chunk.message_id', 'message_id')
      .getRawMany<{ message_id: string }>();

    return result.map((r) => r.message_id);
  }
}
