import { Test, TestingModule } from '@nestjs/testing';
import { EmailFetcherService } from './email-fetcher.service';
import { ConfigModule } from '@nestjs/config';
import { EmailRepoService } from '../email-repo/email-repo.service';
import { UserService } from '../user/user.service';

describe('EmailFetcherService', () => {
  let service: EmailFetcherService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        EmailFetcherService,
        {
          provide: EmailRepoService,
          useValue: { getAllMessageIds: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockResolvedValue({
              id: 1,
              imapHost: 'imap.example.com',
              imapPort: 993,
              imapUser: 'test@example.com',
              imapPass: 'secret',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailFetcherService>(EmailFetcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
