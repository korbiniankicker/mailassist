import { Injectable } from '@nestjs/common';
import { ImapFlow, ListResponse, MailboxLockObject } from 'imapflow';

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

  async getMailboxes(): Promise<ListResponse[] | undefined> {
    try {
      let list: ListResponse[] = await this.client.list();
      list.forEach((list_item) => {
        console.log(list_item);
      });
      return list;
    } catch (error) {
      console.log('Error: ' + error);
      return undefined;
    }
  }

  async *getMessages(mailboxName: string) {
    let mailboxLock: MailboxLockObject =
      await this.client.getMailboxLock(mailboxName);
    try {
      if (this.client.mailbox) {
        if (this.client.mailbox.exists === 0) {
          console.log('No messages in mailbox');
          return;
        }
        for await (let message of this.client.fetch(`1:*`, {
          envelope: true,
          bodyStructure: true,
        })) {
          yield message;
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
