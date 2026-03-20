import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('query')
  handleMessage(
    @MessageBody('prompt') promt: string,
    @ConnectedSocket() client: Socket,
  ) {
    //TODO iterate over ollama response tokens and send back to client
    client.emit('response', 'hello world');
  }
}
