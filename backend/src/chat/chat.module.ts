import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AiLlmModule } from 'src/ai-llm/ai-llm.module';

@Module({
  imports: [AiLlmModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
