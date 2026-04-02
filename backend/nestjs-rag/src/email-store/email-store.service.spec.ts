import { Test, TestingModule } from '@nestjs/testing';
import { EmailStoreService } from './email-store.service';

describe('EmailStoreService', () => {
  let service: EmailStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailStoreService],
    }).compile();

    service = module.get<EmailStoreService>(EmailStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
