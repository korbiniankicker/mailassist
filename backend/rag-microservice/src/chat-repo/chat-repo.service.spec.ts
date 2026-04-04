import { Test, TestingModule } from '@nestjs/testing';
import { ChatRepoService } from './chat-repo.service';

describe('ChatRepoService', () => {
  let service: ChatRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatRepoService],
    }).compile();

    service = module.get<ChatRepoService>(ChatRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
