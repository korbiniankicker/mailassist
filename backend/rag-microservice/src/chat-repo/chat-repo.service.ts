import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './chatmessage.entity';
import { Repository } from 'typeorm';
import { MessageDto } from '../common/dto/messages.dto';
import { Conversation } from './conversation.entity';
import { User } from '../user/user.entity';
import { EmailChunk } from '../email-repo/emailchunk.entity';
import { Message } from 'ollama';

@Injectable()
export class ChatRepoService {
  private readonly logger = new Logger(ChatRepoService.name);
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepo: Repository<ChatMessage>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

  async findAll(
    user_id: number,
    conversation_id: number,
  ): Promise<MessageDto[]> {
    try {
      const response = await this.chatMessageRepo
        .createQueryBuilder('chat_message')
        .select('chat_message.role', 'role')
        .addSelect('chat_message.content', 'content')
        .leftJoin('chat_message.conversation', 'conversation')
        .leftJoin('conversation.user', 'user')
        .where('conversation.id = :conversation_id', {
          conversation_id: conversation_id,
        })
        .andWhere('user.id = :user_id', { user_id: user_id })
        .getRawMany();
      const result: MessageDto[] =
        response.length > 0 ? (response as MessageDto[]) : [];
      return result;
    } catch (error) {
      this.logger.error(`Error fetching message from database: ` + error);
      throw new HttpException(
        `Error fetching message from database`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createConversation(title: string, user_id: number): Promise<number> {
    try {
      const conversation = this.conversationRepo.create({
        title: title,
        user: { id: user_id },
      });
      await this.conversationRepo.insert(conversation);
      return conversation.id;
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error}`);
      throw new HttpException(
        `Error creating conversation`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getConversationById(
    conversation_id: number,
    user_id: number,
  ): Promise<Conversation> {
    try {
      const conversation = await this.conversationRepo.findOne({
        where: { id: conversation_id, user: { id: user_id } },
      });
      if (conversation) {
        return conversation;
      } else {
        throw new HttpException('conversation not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      if (
        !(
          err instanceof HttpException &&
          err.getStatus() == HttpStatus.NOT_FOUND
        )
      ) {
        this.logger.error(err);
        throw new InternalServerErrorException();
      } else {
        throw new HttpException('conversation not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  async storeMessage(role: string, content: string, conversation_id: number) {
    try {
      const message = this.chatMessageRepo.create({
        role: role,
        content: content,
        conversation: { id: conversation_id },
      });
      await this.chatMessageRepo.save(message);
    } catch (error) {
      this.logger.error(`Error storing message to database: ${error}`);
      throw new HttpException(
        `Error storing chat message to database:`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
