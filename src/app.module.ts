import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { EmailFetcherModule } from './email-fetcher/email-fetcher.module';
import { EmailEmbedderModule } from './email-embedder/email-embedder.module';
import { EmailStoreModule } from './email-store/email-store.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ChatModule,
    EmailFetcherModule,
    EmailEmbedderModule,
    EmailStoreModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
