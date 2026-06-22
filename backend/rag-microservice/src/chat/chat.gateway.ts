import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: '/api' })
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('query')
  async handleMessage(
    @MessageBody() data: { prompt: string },
    @ConnectedSocket() client: Socket,
  ) {
    let response: string = '';
    for await (let chunk of this.chatService.generateResponse(data.prompt)) {
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
