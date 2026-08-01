import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmailChunk } from '../email-repo/emailchunk.entity';
import { Conversation } from '../chat-repo/conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  hashedPassword!: string;

  @Column({ nullable: true })
  imapHost?: string;

  @Column({ nullable: true })
  imapPort?: number;

  @Column({ nullable: true })
  imapUser?: string;

  @Column({ nullable: true })
  imapPass?: string;

  @Column({ nullable: true, default: true })
  imapSecure?: boolean;

  @OneToMany(() => EmailChunk, (emailChunk) => emailChunk.user)
  emailChunks!: EmailChunk[];

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations!: Conversation[];
}
