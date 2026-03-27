import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamp } from 'typeorm/browser';

@Entity()
export class EmailChunk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  subject: string;

  @Column('typestamptz')
  date: Date;

  @Column()
  embeddedText: string;

  @Column('vector', { length: 3 })
  embedding: number[];
}
