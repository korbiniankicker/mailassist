import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { AiEmbedderModule } from 'src/ai-embedder/ai-embedder.module';
import { EmailStoreModule } from 'src/email-store/email-store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChunk } from 'src/email-store/emailchunk.entity';

@Module({
  providers: [ContextService],
  imports: [
    TypeOrmModule.forFeature([EmailChunk]),
    AiEmbedderModule,
    EmailStoreModule,
  ],
  exports: [ContextService],
})
export class ContextModule {}
