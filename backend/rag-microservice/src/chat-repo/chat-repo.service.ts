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
    _user_id: number,
    conversation_id: number,
  ): Promise<MessageDto[]> {
    try {
      const messages = await this.chatMessageRepo.find({
        where: { conversation: { id: conversation_id } },
        order: { id: 'ASC' },
      });
      return messages.map((m) => ({ role: m.role, content: m.content }));
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

  async getConversationsByUserId(user_id: number): Promise<Conversation[]> {
    try {
      const conversations = await this.conversationRepo.find({
        where: { user: { id: user_id } },
        order: { createdAt: 'DESC' },
      });
      return conversations;
    } catch (error) {
      this.logger.error(`Error fetching conversations: ${error}`);
      throw new HttpException(
        `Error fetching conversations`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteConversation(conversation_id: number, user_id: number): Promise<void> {
    try {
      const result = await this.conversationRepo.delete({
        id: conversation_id,
        user: { id: user_id },
      });
      if (result.affected === 0) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error deleting conversation: ${error}`);
      throw new HttpException(
        'Error deleting conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
