import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EmailEmbedderService } from './email-embedder.service';
import { HttpException, Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/wsauth.guard';

@UseGuards(WsAuthGuard)
@WebSocketGateway({ cors: true, namespace: '/api' })
export class EmailEmbedderGateway {
  private readonly logger = new Logger(EmailEmbedderGateway.name);
  constructor(private readonly emailEmbedderService: EmailEmbedderService) {}
  @SubscribeMessage('ingest')
  async handleMessage(@ConnectedSocket() client: Socket) {
    try {
      for await (let progress of this.emailEmbedderService.embedEmails(
        client.data.user.id,
      )) {
        client.emit('progress', progress);
      }
      client.emit('progress', 100);
    } catch (error) {
      const code = error instanceof HttpException ? error.getStatus() : 500;
      const message = error instanceof Error ? error.message : 'Ingestion failed';
      this.logger.error(`Ingestion error (${code}): ${message}`);
      client.emit('exception', { code, message });
    }
  }
}
