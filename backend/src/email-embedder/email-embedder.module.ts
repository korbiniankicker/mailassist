import { Module } from '@nestjs/common';
import { EmailEmbedderService } from './email-embedder.service';
import { EmailFetcherModule } from '../email-fetcher/email-fetcher.module';
import { EmailStoreModule } from '../email-store/email-store.module';

@Module({
  imports: [EmailFetcherModule, EmailStoreModule],
  providers: [EmailEmbedderService],
})
export class EmailEmbedderModule {}
