import { Module } from '@nestjs/common';
import { EmailFetcherService } from './email-fetcher.service';
import { EmailRepoModule } from 'src/email-repo/email-repo.module';

@Module({
  imports: [EmailRepoModule],
  providers: [EmailFetcherService],
  exports: [EmailFetcherService],
})
export class EmailFetcherModule {}
