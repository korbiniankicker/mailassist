import { StringifyOptions } from 'querystring';

export class EmailDto {
  messageId: string;
  subject: string;
  sender: string;
  date: Date;
  content: string;
}
