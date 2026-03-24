import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { LlmConnectionModule } from 'src/llm-connection/llm-connection.module';

@Module({
  providers: [ContextService],
  imports: [LlmConnectionModule],
})
export class ContextModule {}
