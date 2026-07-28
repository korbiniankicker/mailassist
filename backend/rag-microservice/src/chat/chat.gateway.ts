import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/wsauth.guard';
import { QueryDto } from '../common/dto/query.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true, namespace: '/api' })
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake?.auth?.token ??
      client.handshake?.headers?.authorization?.split(' ')[1];

    if (!token) {
      client.emit('exception', { code: 401, message: 'Unauthorized' });
      client.disconnect(true); // no room to send a reason via disconnect()
      return;
    }

    try {
      client.data.user = await this.jwtService.verifyAsync(token);
    } catch {
      client.emit('exception', { code: 401, message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('query')
  async handleMessage(
    @MessageBody() data: QueryDto,
    @ConnectedSocket() client: Socket,
  ) {
    let response: string = '';
    if (!data.prompt) {
      client.emit(
        'exception',
        `Bad Request. Pattern: {"prompt":"your prompt"}`,
      );
      return;
    }
    for await (let chunk of this.chatService.generateResponse(
      data.prompt,
      client.data.user.id,
      data.conversation_id,
    )) {
      client.emit('response', chunk);
      response += chunk;
    }
    if (process.env.NODE_ENV == 'development') {
      this.logger.log(`Prompt: ${data.prompt}
          Response: ${response}
      `);
    }
  }
}
