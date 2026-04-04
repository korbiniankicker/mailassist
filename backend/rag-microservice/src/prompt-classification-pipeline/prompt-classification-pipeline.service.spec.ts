import { Test, TestingModule } from '@nestjs/testing';
import { PromptClassificationPipelineService } from './prompt-classification-pipeline.service';

describe('PromptClassificationPipelineService', () => {
  let service: PromptClassificationPipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptClassificationPipelineService],
    }).compile();

    service = module.get<PromptClassificationPipelineService>(PromptClassificationPipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
