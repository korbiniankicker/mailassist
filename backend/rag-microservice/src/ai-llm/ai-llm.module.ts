import { Module } from '@nestjs/common';
import { OllamaLlmService } from './ollama-llm.service';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [ContextModule],
  providers: [OllamaLlmService],
  exports: [OllamaLlmService],
})
export class AiLlmModule {}
