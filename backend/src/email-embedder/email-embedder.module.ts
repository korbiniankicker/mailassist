import { Module } from '@nestjs/common';
import { EmailEmbedderService } from './email-embedder.service';
import { EmailFetcherModule } from '../email-fetcher/email-fetcher.module';
import { OllamaService } from './ollama.service';
import { EmailStoreModule } from '../email-store/email-store.module';

@Module({
  imports: [EmailFetcherModule, EmailStoreModule],
  providers: [EmailEmbedderService, OllamaService],
})
export class EmailEmbedderModule {}
