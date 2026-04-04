import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './chatmessage.entity';
import { Repository } from 'typeorm';
import { MessageDto } from 'src/common/messages.dto';

@Injectable()
export class ChatRepoService {
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
      throw `Error fetching Message from Database: ${error}`;
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
      throw `Error storing chat message to database: ${error}`;
    }
  }
}
