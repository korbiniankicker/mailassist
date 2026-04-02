import { Test, TestingModule } from '@nestjs/testing';
import { AiRerankerService } from './ai-reranker.service';

describe('AiRerankerService', () => {
  let service: AiRerankerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiRerankerService],
    }).compile();

    service = module.get<AiRerankerService>(AiRerankerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
