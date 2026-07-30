import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { HttpAuthGuard } from '../auth/httpauth.guard';
import { ChatRepoService } from '../chat-repo/chat-repo.service';
import { Conversation } from '../chat-repo/conversation.entity';

@Controller('conversations')
@UseGuards(HttpAuthGuard)
export class ChatController {
  constructor(private readonly chatRepoService: ChatRepoService) {}

  @Get()
  async getConversations(@Req() req: any): Promise<Conversation[]> {
    return this.chatRepoService.getConversationsByUserId(req.user.user_id);
  }
}
