import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from './emailchunk.entity';
import { Repository } from 'typeorm';
import { MIN_SIMILARITY, TOP_K } from '../common/constants';

@Injectable()
export class EmailRepoService {
  private readonly logger = new Logger(EmailRepoService.name);

  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
  ) {}

  async storeChunk(
    emailChunk: EmailChunk,
    user_id: number,
  ): Promise<EmailChunk | null> {
    try {
      const _chunk: EmailChunk = this.chunksRepository.create({
        subject: emailChunk.subject,
        sender: emailChunk.sender,
        date: emailChunk.date,
        embedded_text: emailChunk.embedded_text,
        message_id: emailChunk.message_id,
        embedding: emailChunk.embedding,
        user: { id: user_id },
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

  async vectorSimilaritySearch(
    promptEmbedding: number[],
    user_id: number,
  ): Promise<EmailChunk[]> {
    try {
      const results: EmailChunk[] = await this.chunksRepository.query(
        `
          SELECT *
          FROM email_chunk
          WHERE "userId" = $4
            AND 1 - (embedding <=> $1::vector) >= $2
          ORDER BY embedding <=> $1::vector ASC
          LIMIT $3
        `,
        [JSON.stringify(promptEmbedding), MIN_SIMILARITY, TOP_K, user_id],
      );
      return results;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async getAllMessageIds(user_id: number): Promise<string[]> {
    const result = await this.chunksRepository
      .createQueryBuilder('email_chunk')
      .select('DISTINCT email_chunk.message_id', 'message_id')
      .where('email_chunk.user = :user_id', { user_id: user_id })
      .getRawMany<{ message_id: string }>();

    return result.map((r) => r.message_id);
  }
}
