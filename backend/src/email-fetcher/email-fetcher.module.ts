import { Module } from '@nestjs/common';
import { EmailFetcherService } from './email-fetcher.service';

@Module({
  providers: [EmailFetcherService],
  exports: [EmailFetcherService],
})
export class EmailFetcherModule {}
