import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-store/emailchunk.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(EmailChunk)
    private readonly chunksRepository: Repository<EmailChunk>,
    private readonly logger: Logger = new Logger(ContextService.name),
  ) {}
}
