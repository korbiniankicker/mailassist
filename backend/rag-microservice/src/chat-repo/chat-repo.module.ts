import { Module } from '@nestjs/common';
import { ChatRepoService } from './chat-repo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chatmessage.entity';
import { Conversation } from './conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Conversation])],
  providers: [ChatRepoService],
  exports: [ChatRepoService],
})
export class ChatRepoModule {}
