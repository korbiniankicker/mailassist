import { Module } from '@nestjs/common';
import { PromptClassificationPipelineService } from './prompt-classification-pipeline.service';
import { AiLlmModule } from 'src/ai-llm/ai-llm.module';

@Module({
  imports: [AiLlmModule],
  providers: [PromptClassificationPipelineService],
})
export class PromptClassificationPipelineModule {}
