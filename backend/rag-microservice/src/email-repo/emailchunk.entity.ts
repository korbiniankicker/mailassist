import { EMBEDDING_VECTOR_DIMESIONS } from '../common/constants';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class EmailChunk {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sender!: string;

  @Column()
  subject!: string;

  @Column('timestamptz')
  date!: Date;

  @Column()
  embedded_text!: string;

  @Column()
  message_id!: string;

  @Column('vector', { length: Number(EMBEDDING_VECTOR_DIMESIONS) })
  embedding!: number[];

  @ManyToOne(() => User, (user) => user.emailChunks)
  user!: User;
}
