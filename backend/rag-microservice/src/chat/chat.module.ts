import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AiLlmModule } from 'src/ai-llm/ai-llm.module';
import { ChatRepoModule } from 'src/chat-repo/chat-repo.module';
import { PromptClassificationPipelineModule } from 'src/prompt-classification-pipeline/prompt-classification-pipeline.module';

@Module({
  imports: [PromptClassificationPipelineModule, ChatRepoModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
