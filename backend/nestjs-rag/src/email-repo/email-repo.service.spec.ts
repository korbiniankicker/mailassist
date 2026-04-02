import { Test, TestingModule } from '@nestjs/testing';
import { EmailRepoService } from './email-repo.service';

describe('EmailStoreService', () => {
  let service: EmailRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailRepoService],
    }).compile();

    service = module.get<EmailRepoService>(EmailRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
