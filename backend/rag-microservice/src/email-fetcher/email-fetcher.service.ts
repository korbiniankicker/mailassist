import { Injectable, Logger } from '@nestjs/common';
import { ImapFlow, ListResponse, MailboxLockObject } from 'imapflow';
import { EmailDto } from '../common/dto/email.dto';
import { ParsedMail, simpleParser } from 'mailparser';
import { EmailRepoService } from '../email-repo/email-repo.service';

@Injectable()
export class EmailFetcherService {
  private client!: ImapFlow;
  private readonly logger = new Logger(EmailFetcherService.name);

  constructor(private readonly emailRepoService: EmailRepoService) {}

  async connect() {
    this.client = new ImapFlow({
      host: String(process.env.IMAP_HOST),
      port: Number(process.env.IMAP_PORT),
      secure: true,
      auth: {
        user: String(process.env.IMAP_USER),
        pass: String(process.env.IMAP_PASS),
      },
    });
    try {
      await this.client.connect();
      this.logger.log('sucessfully connected to IMAP host');
    } catch (error) {
      this.logger.error('Error: ' + error);
    }
  }

  async getMailboxes(): Promise<string[] | undefined> {
    await this.connect();
    try {
      let list: ListResponse[] = await this.client.list();
      let inboxes: string[] = [];
      list.forEach((list_item) => {
        console.log(list_item);
        inboxes.push(list_item.name);
      });
      return inboxes;
    } catch (error) {
      this.logger.error('Error: ' + error);
      await this.disconnect();
      return undefined;
    }
  }

  async *getMessages(
    mailboxName: string,
  ): AsyncGenerator<{ message: EmailDto; progress: number }> {
    await this.connect();
    const ingestedIds = new Set(await this.emailRepoService.getAllMessageIds());
    let mailboxLock: MailboxLockObject =
      await this.client.getMailboxLock(mailboxName);
    try {
      if (!this.client.mailbox) {
        this.logger.error(`Error: Mailbox ${mailboxName} doesn't exist`);
        return;
      }
      if (this.client.mailbox.exists === 0) {
        this.logger.log('No messages in mailbox');
        return;
      }
      let count: number = 0;
      for await (let message of this.client.fetch(`1:*`, {
        envelope: true,
        source: true,
      })) {
        try {
          count++;
          let progress: number = Math.round(
            (count / this.client.mailbox.exists) * 100,
          );
          if (!message?.source) {
            this.logger.warn(
              `Message ${message?.envelope?.messageId} has no source, skipped`,
            );
            continue;
          }
          const parsed = await simpleParser(message.source);
          if (!parsed.messageId) {
            this.logger.warn(
              `Message ${parsed.messageId} has no messageId, skipped`,
            );
            continue;
          }
          if (ingestedIds.has(parsed.messageId)) {
            this.logger.warn('Email already ingested, skipped');
            continue;
          }
          if (!this.checkMailValidity(parsed)) {
            this.logger.warn('Email invalid, skipped');
            continue;
          }
          let emailDto: EmailDto = {
            messageId: parsed.messageId ?? '',
            subject: parsed.subject ?? '',
            sender: parsed.from?.text ?? '',
            date: parsed.date ?? new Date(),
            content: parsed.text?.trim() ?? '',
          };
          yield {
            message: emailDto,
            progress: progress,
          };
        } catch (error) {
          this.logger.error('Error: Failed to ingest Email - ' + error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Error: Error opening mailbox - ' + error);
    } finally {
      mailboxLock.release();
      await this.disconnect();
    }
  }

  checkMailValidity(email: ParsedMail): boolean {
    if (
      !email.from ||
      !email.subject ||
      !email.messageId ||
      !email.text ||
      !email.date
    ) {
      this.logger.warn(
        `unable to fully fetch email: 
          (MESSAGEID)` +
          email.messageId +
          '(DATE)' +
          email.date +
          '(SUBJECT)' +
          email.subject +
          '(SENDER)' +
          email.from +
          '(CONTENT)' +
          email.text,
      );
      return false;
    }
    return true;
  }

  async disconnect() {
    this.logger.log('Disconnected from IMAP host');
    await this.client.logout();
  }
}
