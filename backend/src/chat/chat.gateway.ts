import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
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
    console.log(`Prompt: ${data.prompt}
                Response: ${response}
      `);
  }
}
