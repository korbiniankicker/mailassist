import { Injectable } from '@nestjs/common';
import { ImapFlow, ListResponse, MailboxLockObject } from 'imapflow';
import { EmailDto } from '../common/email.dto';
import { ParsedMail, simpleParser } from 'mailparser';
import { EmailRepoService } from 'src/email-repo/email-repo.service';

@Injectable()
export class EmailFetcherService {
  private client: ImapFlow;

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
      console.log('sucessfully connected!');
    } catch (error) {
      console.log('Error: ' + error);
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
      console.log('Error: ' + error);
      await this.disconnect();
      return undefined;
    }
  }

  async *getMessages(
    mailboxName: string,
  ): AsyncGenerator<{ message: EmailDto; progress: number }> {
    await this.connect();
    const ingestedIds = new Set(await this.emailRepoService.getAllMessageIds());
    console.log('\x1b[32m%s\x1b[0m', ingestedIds);
    let mailboxLock: MailboxLockObject =
      await this.client.getMailboxLock(mailboxName);
    try {
      if (!this.client.mailbox) {
        console.error(`Error: Mailbox ${mailboxName} doesn't exist`);
        return;
      }
      if (this.client.mailbox.exists === 0) {
        console.log('No messages in mailbox');
        return;
      }
      let count: number = 0;
      for await (let message of this.client.fetch(`1:*`, {
        envelope: true,
        source: true,
      })) {
        console.log(
          '\x1b[32m%s\x1b[0m processing envelope:' +
            message.envelope?.messageId,
        );
        try {
          count++;
          let progress: number = Math.round(
            (count / this.client.mailbox.exists) * 100,
          );
          if (!message?.source) {
            console.warn(
              `Message ${message?.envelope?.messageId} has no source, skipped`,
            );
            continue;
          }
          const parsed = await simpleParser(message.source);
          if (!parsed.messageId) {
            console.warn(
              `Message ${message?.envelope?.messageId} has no messageId, skipped`,
            );
            continue;
          }
          console.log('\x1b[32m%s\x1b[0m', ingestedIds.has(parsed.messageId));
          if (ingestedIds.has(parsed.messageId)) {
            console.log('\x1b[32m%s\x1b[0m Email already ingested, skipped');
            continue;
          }
          if (!this.checkMailValidity(parsed)) {
            console.log('\x1b[32m%s\x1b[0m Email invalid, skipped');
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
          console.error('Error: Failed to ingest Email - ' + error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error: Error opening mailbox - ' + error);
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
      console.warn(
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
    console.warn('Disconnected!');
    await this.client.logout();
  }
}
