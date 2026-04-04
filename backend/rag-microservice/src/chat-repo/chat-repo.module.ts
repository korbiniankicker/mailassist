import { Module } from '@nestjs/common';
import { ChatRepoService } from './chat-repo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chatmessage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage])],
  providers: [ChatRepoService],
  exports: [ChatRepoService],
})
export class ChatRepoModule {}
