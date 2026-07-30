import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ChatMessage } from './chatmessage.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.conversations)
  user!: User;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.conversation)
  chatMessages!: ChatMessage[];
}
