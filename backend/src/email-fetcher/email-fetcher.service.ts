import { Injectable } from '@nestjs/common';
import { ImapFlow, ListResponse, MailboxLockObject } from 'imapflow';
import { EmailDto } from '../common/email.dto';
import { simpleParser } from 'mailparser';

@Injectable()
export class EmailFetcherService {
  private client: ImapFlow;

  constructor() {
    this.client = new ImapFlow({
      host: String(process.env.IMAP_HOST),
      port: Number(process.env.IMAP_PORT),
      secure: true,
      auth: {
        user: String(process.env.IMAP_USER),
        pass: String(process.env.IMAP_PASS),
      },
    });
    this.connect();
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.connect();
      console.log('sucessfully connected!');
      return true;
    } catch (error) {
      console.log('Error: ' + error);
      return false;
    }
  }

  async getMailboxes(): Promise<string[] | undefined> {
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
      return undefined;
    }
  }

  async *getMessages(
    mailboxName: string,
  ): AsyncGenerator<{ message: EmailDto; progress: number }> {
    let mailboxLock: MailboxLockObject =
      await this.client.getMailboxLock(mailboxName);
    try {
      if (this.client.mailbox) {
        if (this.client.mailbox.exists === 0) {
          console.log('No messages in mailbox');
          return;
        }
        let count: number = 0;
        for await (let message of this.client.fetch(`1:*`, {
          envelope: true,
          bodyStructure: true,
          source: true,
        })) {
          try {
            const parsed = await simpleParser(message.source ?? '');
            count++;
            let progress: number = Math.round(
              (count / this.client.mailbox.exists) * 100,
            );
            let emailDto: EmailDto = {
              subject: message.envelope?.subject,
              sender: message.envelope?.sender?.toString(),
              date: message.envelope?.date,
              content: parsed.text?.trim(),
            };
            yield {
              message: emailDto,
              progress: progress,
            };
          } catch (error) {
            console.log('error: ' + error);
            continue;
          }
        }
      }
    } catch (error) {
      console.log('Error: ' + error);
    } finally {
      mailboxLock.release();
    }
  }

  async disconnect() {
    await this.client.logout();
  }
}
