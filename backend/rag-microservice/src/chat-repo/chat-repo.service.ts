import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './chatmessage.entity';
import { Repository } from 'typeorm';
import { MessageDto } from '../common/dto/messages.dto';

@Injectable()
export class ChatRepoService {
  private readonly logger = new Logger(ChatRepoService.name);
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepo: Repository<ChatMessage>,
  ) {}

  async findAll(): Promise<MessageDto[]> {
    try {
      const response: MessageDto[] = await this.chatMessageRepo
        .createQueryBuilder('chat_message')
        .select('chat_message.role', 'role')
        .addSelect('chat_message.content', 'content')
        .getRawMany<{ role: string; content: string }>();
      return response;
    } catch (error) {
      this.logger.error(`Error fetching message from database: ` + error);
      throw new HttpException(
        `Error fetching message from database`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async storeMessage(role: string, content: string) {
    try {
      const message = this.chatMessageRepo.create({
        role: role,
        content: content,
      });
      await this.chatMessageRepo.save(message);
    } catch (error) {
      this.logger.error(`Error fetching message from database: ${error}`);
      throw new HttpException(
        `Error storing chat message to database:`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
