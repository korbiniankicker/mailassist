import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { EmailFetcherModule } from './email-fetcher/email-fetcher.module';
import { EmailEmbedderModule } from './email-embedder/email-embedder.module';
import { EmailRepoModule } from './email-repo/email-repo.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from './email-repo/emailchunk.entity';
import { ContextModule } from './context/context.module';
import { AiLlmModule } from './ai-llm/ai-llm.module';
import { AiEmbedderModule } from './ai-embedder/ai-embedder.module';
import { RerankerModule } from './reranker/reranker.module';
import { AiRerankerModule } from './ai-reranker/ai-reranker.module';
import { ChatRepoModule } from './chat-repo/chat-repo.module';

@Module({
  imports: [
    ChatModule,
    EmailFetcherModule,
    EmailEmbedderModule,
    EmailRepoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [EmailChunk, ChatModule],
      autoLoadEntities: true,
      synchronize: true,
    }),
    ContextModule,
    AiLlmModule,
    AiEmbedderModule,
    RerankerModule,
    AiRerankerModule,
    ChatRepoModule,
  ],
})
export class AppModule {}
