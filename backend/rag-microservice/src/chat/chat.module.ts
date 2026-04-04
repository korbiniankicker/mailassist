import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AiLlmModule } from 'src/ai-llm/ai-llm.module';
import { ChatRepoModule } from 'src/chat-repo/chat-repo.module';

@Module({
  imports: [AiLlmModule, ChatRepoModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
