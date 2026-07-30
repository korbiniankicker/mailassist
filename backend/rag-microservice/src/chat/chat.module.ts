import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiLlmModule } from '../ai-llm/ai-llm.module';
import { ChatRepoModule } from '../chat-repo/chat-repo.module';

@Module({
  imports: [AiLlmModule, ChatRepoModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
