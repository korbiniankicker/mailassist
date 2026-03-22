import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailChunk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column('vector', { length: 3 })
  embedding: number[];
}
