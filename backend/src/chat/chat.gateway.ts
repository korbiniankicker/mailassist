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
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('raw data:', data); // log exactly what arrives
    console.log('data type:', typeof data); // is it a string or object?
    console.log('data keys:', Object.keys(data || {}));
    for await (let chunk of this.chatService.generateResponse(data.prompt)) {
      client.emit('response', chunk);
    }
  }
}
