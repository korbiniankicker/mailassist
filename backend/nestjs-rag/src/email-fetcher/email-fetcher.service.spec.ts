import { Test, TestingModule } from '@nestjs/testing';
import { EmailFetcherService } from './email-fetcher.service';
import { ConfigModule } from '@nestjs/config';

describe('EmailFetcherService', () => {
  let service: EmailFetcherService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [EmailFetcherService],
    }).compile();

    service = module.get<EmailFetcherService>(EmailFetcherService);
  });

  afterAll(async () => {
    await service.disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should connect to imap server', async () => {
    const res = await service.connect();
    expect(res).toBe(true);
  });
  it('should get mailboxes', async () => {
    const res = await service.getMailboxes();
  });
  it('should find messages', async () => {
    for await (let message of service.getMessages('INBOX')) {
      expect(message).toBeDefined();
    }
  });
});
