import { Injectable } from '@nestjs/common';
import { ImapFlow, ListResponse, MailboxLockObject } from 'imapflow';
import { EmailDto } from '../common/email.dto';
import { ParsedMail, simpleParser } from 'mailparser';

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
  }

  async connect() {
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
            if (!this.checkMailValidity(parsed)) {
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
            console.log('error: ' + error);
            continue;
          }
        }
      }
    } catch (error) {
      console.log('Error: ' + error);
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
      console.log(
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
    await this.client.logout();
  }
}
