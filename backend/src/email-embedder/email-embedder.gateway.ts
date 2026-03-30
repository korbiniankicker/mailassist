import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EmailEmbedderService } from './email-embedder.service';

@WebSocketGateway()
export class EmailEmbedderGateway {
  constructor(private readonly emailEmbedderService: EmailEmbedderService) {}
  @SubscribeMessage('ingest')
  async handleMessage(@ConnectedSocket() client: Socket) {
    for await (let progress of this.emailEmbedderService.embedEmails()) {
      client.emit('progress', progress);
    }
  }
}
