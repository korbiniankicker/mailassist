import { EMBEDDING_VECTOR_DIMESIONS } from 'src/common/constants';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailChunk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  subject: string;

  @Column('timestamptz')
  date: Date;

  @Column()
  embeddedText: string;

  @Column('vector', { length: Number(EMBEDDING_VECTOR_DIMESIONS) })
  embedding: number[];
}
