import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ImapFlow, ListResponse, MailboxLockObject } from 'imapflow';
import { EmailDto } from '../common/dto/email.dto';
import { ParsedMail, simpleParser } from 'mailparser';
import { EmailRepoService } from '../email-repo/email-repo.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class EmailFetcherService {
  private client!: ImapFlow;
  private readonly logger = new Logger(EmailFetcherService.name);

  constructor(
    private readonly emailRepoService: EmailRepoService,
    private readonly userService: UserService,
  ) {}

  private buildImapConfig(user: User) {
    if (!user.imapHost || !user.imapUser || !user.imapPass) {
      this.logger.warn(
        `User ${user.id} has no email credentials configured`,
      );
      throw new BadRequestException(
        'No email credentials configured. Please add your email credentials.',
      );
    }

    return {
      host: user.imapHost,
      port: user.imapPort ?? 993,
      secure: user.imapSecure === undefined ? true : user.imapSecure,
      tls:
        process.env.IMAP_TLS_REJECT_UNAUTHORIZED === 'false'
          ? { rejectUnauthorized: false }
          : undefined,
      auth: {
        user: user.imapUser,
        pass: user.imapPass,
      },
    };
  }

  async connect(userId: number) {
    const user = await this.userService.getUserById(userId);
    this.client = new ImapFlow(this.buildImapConfig(user));
    try {
      await this.client.connect();
      this.logger.log(`Successfully connected to IMAP host`);
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(`IMAP connection failed for user ${userId}: ${detail}`);
      throw new BadGatewayException(
        'Unable to connect to the email server. Please check your email credentials.',
      );
    }
  }

  async getMailboxes(userId: number): Promise<string[]> {
    await this.connect(userId);
    try {
      let list: ListResponse[] = await this.client.list();
      let inboxes: string[] = [];
      list.forEach((list_item) => {
        console.log(list_item);
        inboxes.push(list_item.name);
      });
      return inboxes;
    } catch (error) {
      const message = `Failed to list mailboxes: ${error instanceof Error ? error.message : error}`;
      this.logger.error(message);
      await this.disconnect();
      throw new Error(message);
    }
  }

  async *getMessages(
    mailboxName: string,
    user_id: number,
  ): AsyncGenerator<{ message: EmailDto; progress: number }> {
    await this.connect(user_id);
    const ingestedIds = new Set(
      await this.emailRepoService.getAllMessageIds(user_id),
    );
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
      const message = `Failed to open mailbox: ${error instanceof Error ? error.message : error}`;
      this.logger.error(message);
      throw new Error(message);
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
    if (!this.client) return;
    try {
      await this.client.logout();
      this.logger.log('Disconnected from IMAP host');
    } catch (error) {
      this.logger.warn(`Error during disconnect: ${error}`);
    }
  }
}
