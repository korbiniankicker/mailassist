import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { EmailFetcherModule } from './email-fetcher/email-fetcher.module';
import { EmailEmbedderModule } from './email-embedder/email-embedder.module';
import { EmailStoreModule } from './email-store/email-store.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from './email-store/emailchunk.entity';
import { ContextModule } from './context/context.module';

@Module({
  imports: [
    ChatModule,
    EmailFetcherModule,
    EmailEmbedderModule,
    EmailStoreModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [EmailChunk],
    }),
    ContextModule,
  ],
})
export class AppModule {}
