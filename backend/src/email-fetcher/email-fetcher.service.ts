import { Injectable } from '@nestjs/common';
import {
  FetchMessageObject,
  ImapFlow,
  ListResponse,
  ListTreeResponse,
  MailboxLockObject,
} from 'imapflow';

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

  async getMessages(mailboxName: string, limit: number) {
    let mailboxLock: MailboxLockObject =
      await this.client.getMailboxLock(mailboxName);
    try {
      console.log(this.client.mailbox);
      if (this.client.mailbox) {
        if (this.client.mailbox.exists === 0) {
          console.log('No messages in mailbox');
          return;
        }
        let max =
          limit >= this.client.mailbox.exists
            ? limit
            : this.client.mailbox.exists;
        let message: FetchMessageObject = (await this.client.fetchOne('*', {
          envelope: true,
          bodyStructure: true,
        })) as FetchMessageObject;
        console.log(message);
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
