import { Test, TestingModule } from '@nestjs/testing';
import { EmailEmbedderGateway } from './email-embedder.gateway';

describe('EmailEmbedderGateway', () => {
  let gateway: EmailEmbedderGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailEmbedderGateway],
    }).compile();

    gateway = module.get<EmailEmbedderGateway>(EmailEmbedderGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
