import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { AiModule } from 'src/ai/ai.module';

@Module({
  providers: [ContextService],
  imports: [AiModule],
})
export class ContextModule {}
