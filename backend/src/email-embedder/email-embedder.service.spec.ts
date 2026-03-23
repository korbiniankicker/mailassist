import { Test, TestingModule } from '@nestjs/testing';
import { EmailEmbedderService } from './email-embedder.service';

describe('EmailEmbedderService', () => {
  let service: EmailEmbedderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailEmbedderService],
    }).compile();

    service = module.get<EmailEmbedderService>(EmailEmbedderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
