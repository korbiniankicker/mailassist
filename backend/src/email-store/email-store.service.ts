import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailStoreService {
  constructor(
    @InjectRepository(EmailChunk)
    private chunksRepository: Repository<EmailChunk>,
  ) {}

  async storeChunk(
    _sender: string,
    _embedding: number[],
  ): Promise<EmailChunk | null> {
    const _chunk: EmailChunk = this.chunksRepository.create({
      sender: _sender,
      embedding: _embedding,
    });
    return await this.chunksRepository.save(_chunk);
  }
}
