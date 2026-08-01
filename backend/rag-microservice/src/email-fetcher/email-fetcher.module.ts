import { Module } from '@nestjs/common';
import { EmailFetcherService } from './email-fetcher.service';
import { EmailRepoModule } from '../email-repo/email-repo.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [EmailRepoModule, UserModule],
  providers: [EmailFetcherService],
  exports: [EmailFetcherService],
})
export class EmailFetcherModule {}
