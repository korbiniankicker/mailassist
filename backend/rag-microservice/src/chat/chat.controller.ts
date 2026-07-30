import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { HttpAuthGuard } from '../auth/httpauth.guard';
import { ChatRepoService } from '../chat-repo/chat-repo.service';
import { Conversation } from '../chat-repo/conversation.entity';
import { MessageDto } from '../common/dto/messages.dto';

@Controller('conversations')
@UseGuards(HttpAuthGuard)
export class ChatController {
  constructor(private readonly chatRepoService: ChatRepoService) {}

  @Get()
  async getConversations(@Req() req: any): Promise<Conversation[]> {
    return this.chatRepoService.getConversationsByUserId(req.user.id);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<MessageDto[]> {
    return this.chatRepoService.findAll(req.user.id, Number(id));
  }

  @Delete(':id')
  async deleteConversation(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    return this.chatRepoService.deleteConversation(Number(id), req.user.id);
  }
}
