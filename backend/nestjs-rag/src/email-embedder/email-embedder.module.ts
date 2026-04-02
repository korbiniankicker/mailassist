import { Module } from '@nestjs/common';
import { EmailEmbedderService } from './email-embedder.service';
import { EmailFetcherModule } from '../email-fetcher/email-fetcher.module';
import { EmailStoreModule } from '../email-store/email-store.module';
import { AiEmbedderModule } from 'src/ai-embedder/ai-embedder.module';
import { EmailEmbedderGateway } from './email-embedder.gateway';

@Module({
  imports: [EmailFetcherModule, EmailStoreModule, AiEmbedderModule],
  providers: [EmailEmbedderService, EmailEmbedderGateway],
})
export class EmailEmbedderModule {}
