import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/wsauth.guard';
import { QueryDto } from '../common/dto/query.dto';

@WebSocketGateway({ cors: true, namespace: '/api' })
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('query')
  async handleMessage(
    @MessageBody() data: QueryDto,
    @ConnectedSocket() client: Socket,
  ) {
    let response: string = '';
    for await (let chunk of this.chatService.generateResponse(
      data.prompt,
      client.data.user.id,
      data.conversation_id,
    )) {
      client.emit('response', chunk);
      response += chunk;
    }
    if (process.env.NODE_ENV == 'production') {
      this.logger.log(`Prompt: ${data.prompt}
                Response: ${response}
      `);
    }
  }
}
