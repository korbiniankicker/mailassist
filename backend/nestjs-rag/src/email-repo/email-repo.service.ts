import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailRepoService {
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

  async getAllMessageIds(): Promise<string[]> {
    const result: EmailChunk[] = await this.chunksRepository
      .createQueryBuilder('email_chunk')
      .select('message_id')
      .from(EmailChunk, 'email_chunk')
      .getMany();

    const ids: string[] = result.map((r) => {
      return r.message_id;
    });

    return ids;
  }
}
