import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EmailEmbedderService } from './email-embedder.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/wsauth.guard';

@UseGuards(WsAuthGuard)
@WebSocketGateway({ cors: true, namespace: '/api' })
export class EmailEmbedderGateway {
  constructor(private readonly emailEmbedderService: EmailEmbedderService) {}
  @SubscribeMessage('ingest')
  async handleMessage(@ConnectedSocket() client: Socket) {
    for await (let progress of this.emailEmbedderService.embedEmails(
      client.data.user.id,
    )) {
      client.emit('progress', progress);
    }
  }
}
